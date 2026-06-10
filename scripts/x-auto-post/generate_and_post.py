"""
HOSHIYOMI X自動投稿スクリプト
1日数回、当日の天体イベント(月星座・星座移動・新月満月・逆行)を計算し、
Claude APIで投稿文を生成してXに自動投稿する。

必要な環境変数:
  X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET  (X API OAuth1.0a)
  ANTHROPIC_API_KEY  (投稿文生成用。未設定ならテンプレート文で投稿)
オプション:
  SITE_URL   (投稿に添えるリンク。例 https://hoshiyomi4u.com/m)
  DRY_RUN=1  (投稿せず文面だけ表示)
"""

import os
import sys
import json
import random
from datetime import datetime, timedelta, timezone

import requests
from requests_oauthlib import OAuth1
import swisseph as swe

JST = timezone(timedelta(hours=9))
SITE_URL = os.environ.get("SITE_URL", "https://hoshiyomi4u.com/m")

SIGNS = [
    "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座",
    "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座",
]

PLANETS = {
    swe.SUN: "太陽", swe.MOON: "月", swe.MERCURY: "水星",
    swe.VENUS: "金星", swe.MARS: "火星", swe.JUPITER: "木星",
    swe.SATURN: "土星", swe.URANUS: "天王星",
    swe.NEPTUNE: "海王星", swe.PLUTO: "冥王星",
}

FLAG = swe.FLG_MOSEPH | swe.FLG_SPEED  # 内蔵暦を使用(外部ファイル不要)


def jd_from(dt_jst: datetime) -> float:
    """JSTのdatetimeをユリウス日(UT)に変換"""
    ut = dt_jst.astimezone(timezone.utc)
    return swe.julday(
        ut.year, ut.month, ut.day,
        ut.hour + ut.minute / 60 + ut.second / 3600,
    )


def calc(jd: float, planet: int):
    """(黄経, 速度) を返す"""
    pos, _ = swe.calc_ut(jd, planet, FLAG)
    return pos[0] % 360.0, pos[3]


def sign_of(lon: float) -> str:
    return SIGNS[int(lon // 30) % 12]


def moon_phase_angle(jd: float) -> float:
    sun_lon, _ = calc(jd, swe.SUN)
    moon_lon, _ = calc(jd, swe.MOON)
    return (moon_lon - sun_lon) % 360.0


def crosses(start: float, end: float, target: float) -> bool:
    """角度start→endの間にtargetを通過したか(月相検出用)"""
    diff = (end - start) % 360.0
    rel = (target - start) % 360.0
    return 0 < rel <= diff


def todays_sky(now: datetime) -> dict:
    """今日(JST)の天体イベントをまとめて返す"""
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    jd0, jd1, jd_now = jd_from(day_start), jd_from(day_end), jd_from(now)

    events = []

    # 新月・満月
    p0, p1 = moon_phase_angle(jd0), moon_phase_angle(jd1)
    if crosses(p0, p1, 0.0):
        events.append(f"今日は{sign_of(calc(jd_now, swe.MOON)[0])}の新月")
    if crosses(p0, p1, 180.0):
        events.append(f"今日は{sign_of(calc(jd_now, swe.MOON)[0])}の満月")

    # 星座移動(イングレス)と逆行の開始・終了
    retrogrades = []
    for planet, name in PLANETS.items():
        lon0, spd0 = calc(jd0, planet)
        lon1, spd1 = calc(jd1, planet)
        s0, s1 = sign_of(lon0), sign_of(lon1)
        if s0 != s1:
            events.append(f"{name}が{s0}から{s1}へ移動")
        if planet not in (swe.SUN, swe.MOON):
            if spd0 >= 0 > spd1:
                events.append(f"{name}が{s1}で逆行を開始")
            elif spd0 < 0 <= spd1:
                events.append(f"{name}の逆行が{s1}で終了(順行へ)")
            elif spd1 < 0:
                retrogrades.append(f"{name}({s1})")

    moon_lon, _ = calc(jd_now, swe.MOON)
    phase = moon_phase_angle(jd_now)
    phase_name = (
        "新月期" if phase < 45 else "上弦に向かう月" if phase < 90
        else "満ちていく月" if phase < 135 else "満月前" if phase < 180
        else "満月直後" if phase < 225 else "欠けていく月" if phase < 270
        else "下弦の月" if phase < 315 else "新月前の月"
    )

    return {
        "date": now.strftime("%Y年%m月%d日"),
        "weekday": "月火水木金土日"[now.weekday()],
        "moon_sign": sign_of(moon_lon),
        "moon_phase": phase_name,
        "events": events,
        "retrogrades": retrogrades,
    }


def slot_for(now: datetime) -> str:
    h = now.hour
    return "morning" if h < 11 else "noon" if h < 17 else "night"


SLOT_BRIEF = {
    "morning": "朝の投稿。今日の月星座と月相から、今日一日の過ごし方のヒントを1つ。",
    "noon": "昼の投稿。占星術の豆知識や用語をひとつ、初心者にも分かる言葉で。今日の星の状態に絡められると良い。",
    "night": "夜の投稿。今日の星をふり返りつつ、明日への小さな指針を。落ち着いた静かなトーン。",
}

TEMPLATES = {
    "morning": "{date}({weekday})。今日の月は{moon_sign}、{moon_phase}。{event_line}自分の出生図でどう響くかは、プロフィールのリンクから無料で確認できます。",
    "noon": "月は約2.5日ごとに星座を移ります。いまは{moon_sign}。同じ日でも、生まれた時刻と場所で星の地図はまったく別物になります。",
    "night": "今日もおつかれさまでした。{moon_phase}の夜。{event_line}明日の星はまた少し動きます。",
}


def fallback_text(sky: dict, slot: str) -> str:
    event_line = ""
    if sky["events"]:
        event_line = sky["events"][0] + "。"
    return TEMPLATES[slot].format(event_line=event_line, **sky)


def generate_text(sky: dict, slot: str) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return fallback_text(sky, slot)

    include_link = slot == "morning" or bool(sky["events"])
    link_note = (
        f"文末に改行してから {SITE_URL} を添える。"
        if include_link else "リンクは入れない。"
    )

    prompt = f"""あなたは占星術アカウント「HOSHIYOMI」の中の人です。Xへの投稿文を1つだけ書いてください。

今日の星のデータ:
{json.dumps(sky, ensure_ascii=False, indent=2)}

投稿の種類: {SLOT_BRIEF[slot]}

ルール:
- 本文は全角120字以内。リンクは字数に含めない
- 「絶対」「必ず当たる」など断定的・効果保証的な表現は禁止
- 不安を煽らない。逆行も「見直しに向く時期」のような前向きな整理で
- ハッシュタグは #星読み #占星術 のどちらか1つだけ、文末に
- 絵文字は0〜1個
- データにあるイベント(新月・満月・星座移動・逆行)があれば最優先で扱う
- {link_note}
- 投稿文だけを出力。前置きや説明は不要"""

    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 400,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60,
    )
    resp.raise_for_status()
    text = "".join(
        b.get("text", "") for b in resp.json()["content"] if b["type"] == "text"
    ).strip()
    return text or fallback_text(sky, slot)


def post_to_x(text: str) -> dict:
    auth = OAuth1(
        os.environ["X_API_KEY"],
        os.environ["X_API_SECRET"],
        os.environ["X_ACCESS_TOKEN"],
        os.environ["X_ACCESS_SECRET"],
    )
    resp = requests.post(
        "https://api.twitter.com/2/tweets",
        auth=auth,
        json={"text": text},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def main():
    now = datetime.now(JST)
    slot = sys.argv[1] if len(sys.argv) > 1 else slot_for(now)
    sky = todays_sky(now)
    print(f"[sky] {json.dumps(sky, ensure_ascii=False)}")

    text = generate_text(sky, slot)
    print(f"[post:{slot}]\n{text}\n")

    if os.environ.get("DRY_RUN") == "1":
        print("[dry-run] 投稿はスキップしました")
        return

    result = post_to_x(text)
    print(f"[posted] {json.dumps(result, ensure_ascii=False)}")


if __name__ == "__main__":
    main()
