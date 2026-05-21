"use client";

import { useMemo, useState } from "react";

type GuideSection = {
  title: string;
  body: string[];
};

type GlossaryGroup = {
  title: string;
  items: {
    term: string;
    description: string;
  }[];
};

type GlossaryGuideProps = {
  glossaryGroups: GlossaryGroup[];
  guideSections: GuideSection[];
};

export function GlossaryGuide({ glossaryGroups, guideSections }: GlossaryGuideProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeText(query);

  const filteredGuideSections = useMemo(() => {
    if (!normalizedQuery) return guideSections;
    return guideSections.filter((section) => normalizeText([section.title, ...section.body].join(" ")).includes(normalizedQuery));
  }, [guideSections, normalizedQuery]);

  const filteredGlossaryGroups = useMemo(() => {
    if (!normalizedQuery) return glossaryGroups;
    return glossaryGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => normalizeText(`${group.title} ${item.term} ${item.description}`).includes(normalizedQuery))
      }))
      .filter((group) => group.items.length > 0);
  }, [glossaryGroups, normalizedQuery]);

  const resultCount = filteredGuideSections.length + filteredGlossaryGroups.reduce((sum, group) => sum + group.items.length, 0);
  const hasResults = resultCount > 0;

  return (
    <>
      <div className="glossary-search-panel">
        <label htmlFor="glossary-search">用語やテーマを検索</label>
        <div className="glossary-search-row">
          <input
            id="glossary-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ASC、金星、シナストリー、アスペクトなど"
            type="search"
            value={query}
          />
          {query ? (
            <button className="button" onClick={() => setQuery("")} type="button">
              クリア
            </button>
          ) : null}
        </div>
        <p>{query ? `${resultCount}件見つかりました` : "知りたい言葉を入れると、該当する説明だけに絞り込めます。"}</p>
      </div>

      {hasResults ? (
        <>
          {!query ? (
            <section className="glossary-visual-panel" aria-label="ホロスコープの読み方">
              <img src="/images/orion-star-field.jpg" alt="実際の星空" />
              <div>
                <span>From Real Sky To Personal Reading</span>
                <h2>星空を、あなたの地図として読む</h2>
                <p>
                  ホロスコープは、実際の天体位置をもとに、天体・サイン・ハウス・アスペクトを重ねて読むための図です。
                  ただの用語暗記ではなく、「何を見るための言葉か」がわかるように整理しています。
                </p>
                <div className="guide-visual-stats">
                  <b>10天体</b>
                  <b>12星座</b>
                  <b>12ハウス</b>
                  <b>主要アスペクト</b>
                </div>
              </div>
            </section>
          ) : null}

          <div className="guide-index">
            {filteredGuideSections.map((section) => (
              <a href={`#${slugifyGuideTitle(section.title)}`} key={section.title}>
                {section.title}
              </a>
            ))}
          </div>

          <div className="guide-section-list">
            {filteredGuideSections.map((section, index) => (
              <article className="guide-section-card" id={slugifyGuideTitle(section.title)} key={section.title}>
                <div className="guide-section-heading">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{section.title}</h2>
                </div>
                <p className="guide-section-lead">{section.body[0]}</p>
                <div className="guide-point-box">
                  <span>読み方のポイント</span>
                  <ul>
                    {section.body.slice(1).map((paragraph) => (
                      <li key={paragraph}>{paragraph}</li>
                    ))}
                  </ul>
                </div>
                <div className="guide-tags">
                  {getGuideTags(section.title).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {filteredGlossaryGroups.map((group) => (
            <div className="glossary-group" key={group.title}>
              <h2>{group.title}</h2>
              <div className="glossary-grid">
                {group.items.map((item) => (
                  <article className="glossary-card" key={item.term}>
                    <h3>{item.term}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="glossary-no-results">
          <h2>該当する説明が見つかりませんでした</h2>
          <p>別の言葉で検索するか、「星座」「恋愛」「ハウス」「相性」のように少し広い言葉で試してみてください。</p>
        </div>
      )}
    </>
  );
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function slugifyGuideTitle(title: string) {
  return title
    .replace(/[？?（）()・/]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getGuideTags(title: string) {
  if (title.includes("種類") || title.includes("チャート")) return ["チャートの種類", "相性", "時期読み"];
  if (title.includes("惑星") || title.includes("太陽") || title.includes("月") || title.includes("水星") || title.includes("金星")) return ["天体", "運勢", "心理"];
  if (title.includes("サイン") || title.includes("星座") || title.includes("ポラリティ") || title.includes("クオリティ") || title.includes("エレメント")) return ["12星座", "性質", "分類"];
  if (title.includes("ハウス") || title.includes("カスプ") || title.includes("アングル") || title.includes("ASC") || title.includes("MC") || title.includes("IC") || title.includes("ディセンダント") || title.includes("アセンダント")) return ["出生時刻", "人生領域", "軸"];
  if (title.includes("アスペクト") || title.includes("オーブ")) return ["角度", "関係性", "才能と葛藤"];
  return ["基礎", "読み方", "ホロスコープ"];
}
