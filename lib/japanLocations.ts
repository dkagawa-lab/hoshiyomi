export type Municipality = {
  name: string;
  latitude: number;
  longitude: number;
};

export type PrefectureLocations = {
  prefecture: string;
  municipalities: Municipality[];
};

// Municipality names are generated from jmcjson pref_lce.json, which is based on MIC local government code data.
// Coordinates are representative points resolved through the Geospatial Information Authority of Japan address search.
export const japanLocations: PrefectureLocations[] = [
  {
    "prefecture": "北海道",
    "municipalities": [
      {
        "name": "札幌市",
        "latitude": 43.0621,
        "longitude": 141.3544
      },
      {
        "name": "函館市",
        "latitude": 41.7687,
        "longitude": 140.7289
      },
      {
        "name": "小樽市",
        "latitude": 43.1907,
        "longitude": 140.9945
      },
      {
        "name": "旭川市",
        "latitude": 43.7714,
        "longitude": 142.3653
      },
      {
        "name": "室蘭市",
        "latitude": 42.3152,
        "longitude": 140.9738
      },
      {
        "name": "釧路市",
        "latitude": 42.9849,
        "longitude": 144.3818
      },
      {
        "name": "帯広市",
        "latitude": 42.9242,
        "longitude": 143.1962
      },
      {
        "name": "北見市",
        "latitude": 43.8029,
        "longitude": 143.8947
      },
      {
        "name": "夕張市",
        "latitude": 43.0567,
        "longitude": 141.9739
      },
      {
        "name": "岩見沢市",
        "latitude": 43.196,
        "longitude": 141.7754
      },
      {
        "name": "網走市",
        "latitude": 44.0201,
        "longitude": 144.2684
      },
      {
        "name": "留萌市",
        "latitude": 43.941,
        "longitude": 141.6369
      },
      {
        "name": "苫小牧市",
        "latitude": 42.6341,
        "longitude": 141.6055
      },
      {
        "name": "稚内市",
        "latitude": 45.4157,
        "longitude": 141.6731
      },
      {
        "name": "美唄市",
        "latitude": 43.3329,
        "longitude": 141.8538
      },
      {
        "name": "芦別市",
        "latitude": 43.5182,
        "longitude": 142.1895
      },
      {
        "name": "江別市",
        "latitude": 43.1037,
        "longitude": 141.5362
      },
      {
        "name": "赤平市",
        "latitude": 43.558,
        "longitude": 142.0442
      },
      {
        "name": "紋別市",
        "latitude": 44.3564,
        "longitude": 143.3544
      },
      {
        "name": "士別市",
        "latitude": 44.1781,
        "longitude": 142.4008
      },
      {
        "name": "名寄市",
        "latitude": 44.3559,
        "longitude": 142.4632
      },
      {
        "name": "三笠市",
        "latitude": 43.2457,
        "longitude": 141.8752
      },
      {
        "name": "根室市",
        "latitude": 43.3301,
        "longitude": 145.5835
      },
      {
        "name": "千歳市",
        "latitude": 42.821,
        "longitude": 141.651
      },
      {
        "name": "滝川市",
        "latitude": 43.5578,
        "longitude": 141.9104
      },
      {
        "name": "砂川市",
        "latitude": 43.4943,
        "longitude": 141.9025
      },
      {
        "name": "歌志内市",
        "latitude": 43.5214,
        "longitude": 142.0345
      },
      {
        "name": "深川市",
        "latitude": 43.7236,
        "longitude": 142.0538
      },
      {
        "name": "富良野市",
        "latitude": 43.3423,
        "longitude": 142.3835
      },
      {
        "name": "登別市",
        "latitude": 42.4128,
        "longitude": 141.1067
      },
      {
        "name": "恵庭市",
        "latitude": 42.8826,
        "longitude": 141.5778
      },
      {
        "name": "伊達市",
        "latitude": 42.4719,
        "longitude": 140.8647
      },
      {
        "name": "北広島市",
        "latitude": 42.9855,
        "longitude": 141.5628
      },
      {
        "name": "石狩市",
        "latitude": 43.1713,
        "longitude": 141.3155
      },
      {
        "name": "北斗市",
        "latitude": 41.8242,
        "longitude": 140.6531
      },
      {
        "name": "当別町",
        "latitude": 43.2237,
        "longitude": 141.517
      },
      {
        "name": "新篠津村",
        "latitude": 43.2253,
        "longitude": 141.6492
      },
      {
        "name": "松前町",
        "latitude": 41.43,
        "longitude": 140.1104
      },
      {
        "name": "福島町",
        "latitude": 41.4839,
        "longitude": 140.2514
      },
      {
        "name": "知内町",
        "latitude": 41.5983,
        "longitude": 140.4189
      },
      {
        "name": "木古内町",
        "latitude": 41.6784,
        "longitude": 140.4377
      },
      {
        "name": "七飯町",
        "latitude": 41.8957,
        "longitude": 140.6944
      },
      {
        "name": "鹿部町",
        "latitude": 42.0266,
        "longitude": 140.8317
      },
      {
        "name": "森町",
        "latitude": 42.105,
        "longitude": 140.5765
      },
      {
        "name": "八雲町",
        "latitude": 42.256,
        "longitude": 140.2653
      },
      {
        "name": "長万部町",
        "latitude": 42.5135,
        "longitude": 140.3803
      },
      {
        "name": "江差町",
        "latitude": 41.8692,
        "longitude": 140.1275
      },
      {
        "name": "上ノ国町",
        "latitude": 41.8011,
        "longitude": 140.1214
      },
      {
        "name": "厚沢部町",
        "latitude": 41.9209,
        "longitude": 140.2254
      },
      {
        "name": "乙部町",
        "latitude": 41.9685,
        "longitude": 140.1357
      },
      {
        "name": "奥尻町",
        "latitude": 42.1723,
        "longitude": 139.5122
      },
      {
        "name": "今金町",
        "latitude": 42.4293,
        "longitude": 140.0087
      },
      {
        "name": "せたな町",
        "latitude": 42.417,
        "longitude": 139.8833
      },
      {
        "name": "島牧村",
        "latitude": 42.7005,
        "longitude": 140.0615
      },
      {
        "name": "寿都町",
        "latitude": 42.7911,
        "longitude": 140.2288
      },
      {
        "name": "黒松内町",
        "latitude": 42.6679,
        "longitude": 140.3075
      },
      {
        "name": "蘭越町",
        "latitude": 42.8092,
        "longitude": 140.5284
      },
      {
        "name": "ニセコ町",
        "latitude": 42.805,
        "longitude": 140.688
      },
      {
        "name": "真狩村",
        "latitude": 42.763,
        "longitude": 140.8037
      },
      {
        "name": "留寿都村",
        "latitude": 42.7373,
        "longitude": 140.8756
      },
      {
        "name": "喜茂別町",
        "latitude": 42.7954,
        "longitude": 140.9345
      },
      {
        "name": "京極町",
        "latitude": 42.8582,
        "longitude": 140.8841
      },
      {
        "name": "倶知安町",
        "latitude": 42.9015,
        "longitude": 140.759
      },
      {
        "name": "共和町",
        "latitude": 42.9804,
        "longitude": 140.6114
      },
      {
        "name": "岩内町",
        "latitude": 42.9798,
        "longitude": 140.5147
      },
      {
        "name": "泊村",
        "latitude": 43.063,
        "longitude": 140.4989
      },
      {
        "name": "神恵内村",
        "latitude": 43.1434,
        "longitude": 140.4308
      },
      {
        "name": "積丹町",
        "latitude": 43.2987,
        "longitude": 140.598
      },
      {
        "name": "古平町",
        "latitude": 43.264,
        "longitude": 140.6387
      },
      {
        "name": "仁木町",
        "latitude": 43.1517,
        "longitude": 140.7661
      },
      {
        "name": "余市町",
        "latitude": 43.1953,
        "longitude": 140.7835
      },
      {
        "name": "赤井川村",
        "latitude": 43.0835,
        "longitude": 140.8136
      },
      {
        "name": "南幌町",
        "latitude": 43.0638,
        "longitude": 141.6504
      },
      {
        "name": "奈井江町",
        "latitude": 43.4255,
        "longitude": 141.8835
      },
      {
        "name": "上砂川町",
        "latitude": 43.4828,
        "longitude": 141.9843
      },
      {
        "name": "由仁町",
        "latitude": 42.9996,
        "longitude": 141.7903
      },
      {
        "name": "長沼町",
        "latitude": 43.0104,
        "longitude": 141.6953
      },
      {
        "name": "栗山町",
        "latitude": 43.0563,
        "longitude": 141.7843
      },
      {
        "name": "月形町",
        "latitude": 43.3383,
        "longitude": 141.6695
      },
      {
        "name": "浦臼町",
        "latitude": 43.4304,
        "longitude": 141.8187
      },
      {
        "name": "新十津川町",
        "latitude": 43.5488,
        "longitude": 141.8771
      },
      {
        "name": "妹背牛町",
        "latitude": 43.7002,
        "longitude": 141.9615
      },
      {
        "name": "秩父別町",
        "latitude": 43.767,
        "longitude": 141.9579
      },
      {
        "name": "雨竜町",
        "latitude": 43.6439,
        "longitude": 141.8897
      },
      {
        "name": "北竜町",
        "latitude": 43.7314,
        "longitude": 141.8792
      },
      {
        "name": "沼田町",
        "latitude": 43.8067,
        "longitude": 141.9337
      },
      {
        "name": "鷹栖町",
        "latitude": 43.8433,
        "longitude": 142.3544
      },
      {
        "name": "東神楽町",
        "latitude": 43.6965,
        "longitude": 142.4513
      },
      {
        "name": "当麻町",
        "latitude": 43.8278,
        "longitude": 142.5081
      },
      {
        "name": "比布町",
        "latitude": 43.875,
        "longitude": 142.4777
      },
      {
        "name": "愛別町",
        "latitude": 43.9067,
        "longitude": 142.5778
      },
      {
        "name": "上川町",
        "latitude": 43.8471,
        "longitude": 142.7705
      },
      {
        "name": "東川町",
        "latitude": 43.6988,
        "longitude": 142.5102
      },
      {
        "name": "美瑛町",
        "latitude": 43.5883,
        "longitude": 142.467
      },
      {
        "name": "上富良野町",
        "latitude": 43.4557,
        "longitude": 142.4671
      },
      {
        "name": "中富良野町",
        "latitude": 43.4055,
        "longitude": 142.425
      },
      {
        "name": "南富良野町",
        "latitude": 43.1642,
        "longitude": 142.5683
      },
      {
        "name": "占冠村",
        "latitude": 42.9799,
        "longitude": 142.3985
      },
      {
        "name": "和寒町",
        "latitude": 44.0231,
        "longitude": 142.4134
      },
      {
        "name": "剣淵町",
        "latitude": 44.0958,
        "longitude": 142.3613
      },
      {
        "name": "下川町",
        "latitude": 44.3026,
        "longitude": 142.6352
      },
      {
        "name": "美深町",
        "latitude": 44.481,
        "longitude": 142.3431
      },
      {
        "name": "音威子府村",
        "latitude": 44.725,
        "longitude": 142.2622
      },
      {
        "name": "中川町",
        "latitude": 44.8114,
        "longitude": 142.0714
      },
      {
        "name": "幌加内町",
        "latitude": 44.0098,
        "longitude": 142.1538
      },
      {
        "name": "増毛町",
        "latitude": 43.8561,
        "longitude": 141.5249
      },
      {
        "name": "小平町",
        "latitude": 44.0155,
        "longitude": 141.6628
      },
      {
        "name": "苫前町",
        "latitude": 44.3061,
        "longitude": 141.6529
      },
      {
        "name": "羽幌町",
        "latitude": 44.3606,
        "longitude": 141.6973
      },
      {
        "name": "初山別村",
        "latitude": 44.5321,
        "longitude": 141.7663
      },
      {
        "name": "遠別町",
        "latitude": 44.7225,
        "longitude": 141.7923
      },
      {
        "name": "天塩町",
        "latitude": 44.8882,
        "longitude": 141.7453
      },
      {
        "name": "猿払村",
        "latitude": 45.3306,
        "longitude": 142.109
      },
      {
        "name": "浜頓別町",
        "latitude": 45.1238,
        "longitude": 142.3597
      },
      {
        "name": "中頓別町",
        "latitude": 44.9698,
        "longitude": 142.2867
      },
      {
        "name": "枝幸町",
        "latitude": 44.9387,
        "longitude": 142.5814
      },
      {
        "name": "豊富町",
        "latitude": 45.1029,
        "longitude": 141.7775
      },
      {
        "name": "礼文町",
        "latitude": 45.3031,
        "longitude": 141.0477
      },
      {
        "name": "利尻町",
        "latitude": 45.187,
        "longitude": 141.1396
      },
      {
        "name": "利尻富士町",
        "latitude": 45.2475,
        "longitude": 141.2147
      },
      {
        "name": "幌延町",
        "latitude": 45.0178,
        "longitude": 141.8494
      },
      {
        "name": "美幌町",
        "latitude": 43.8242,
        "longitude": 144.1075
      },
      {
        "name": "津別町",
        "latitude": 43.7063,
        "longitude": 144.0252
      },
      {
        "name": "斜里町",
        "latitude": 43.9115,
        "longitude": 144.6708
      },
      {
        "name": "清里町",
        "latitude": 43.8352,
        "longitude": 144.5947
      },
      {
        "name": "小清水町",
        "latitude": 43.857,
        "longitude": 144.4625
      },
      {
        "name": "訓子府町",
        "latitude": 43.7254,
        "longitude": 143.7417
      },
      {
        "name": "置戸町",
        "latitude": 43.6764,
        "longitude": 143.5864
      },
      {
        "name": "佐呂間町",
        "latitude": 44.0179,
        "longitude": 143.7748
      },
      {
        "name": "遠軽町",
        "latitude": 44.062,
        "longitude": 143.528
      },
      {
        "name": "湧別町",
        "latitude": 44.1516,
        "longitude": 143.573
      },
      {
        "name": "滝上町",
        "latitude": 44.1923,
        "longitude": 143.0776
      },
      {
        "name": "興部町",
        "latitude": 44.4699,
        "longitude": 143.124
      },
      {
        "name": "西興部村",
        "latitude": 44.3288,
        "longitude": 142.9445
      },
      {
        "name": "雄武町",
        "latitude": 44.5825,
        "longitude": 142.962
      },
      {
        "name": "大空町",
        "latitude": 43.9119,
        "longitude": 144.1725
      },
      {
        "name": "豊浦町",
        "latitude": 42.5834,
        "longitude": 140.712
      },
      {
        "name": "壮瞥町",
        "latitude": 42.5521,
        "longitude": 140.8858
      },
      {
        "name": "白老町",
        "latitude": 42.5512,
        "longitude": 141.3559
      },
      {
        "name": "厚真町",
        "latitude": 42.7237,
        "longitude": 141.8779
      },
      {
        "name": "洞爺湖町",
        "latitude": 42.5511,
        "longitude": 140.7643
      },
      {
        "name": "安平町",
        "latitude": 42.7628,
        "longitude": 141.818
      },
      {
        "name": "むかわ町",
        "latitude": 42.5747,
        "longitude": 141.9267
      },
      {
        "name": "日高町",
        "latitude": 42.4803,
        "longitude": 142.0743
      },
      {
        "name": "平取町",
        "latitude": 42.5851,
        "longitude": 142.1287
      },
      {
        "name": "新冠町",
        "latitude": 42.3624,
        "longitude": 142.3184
      },
      {
        "name": "浦河町",
        "latitude": 42.1683,
        "longitude": 142.7682
      },
      {
        "name": "様似町",
        "latitude": 42.1278,
        "longitude": 142.9339
      },
      {
        "name": "えりも町",
        "latitude": 42.0164,
        "longitude": 143.1483
      },
      {
        "name": "新ひだか町",
        "latitude": 42.3413,
        "longitude": 142.3686
      },
      {
        "name": "音更町",
        "latitude": 42.994,
        "longitude": 143.1981
      },
      {
        "name": "士幌町",
        "latitude": 43.168,
        "longitude": 143.2415
      },
      {
        "name": "上士幌町",
        "latitude": 43.2326,
        "longitude": 143.2962
      },
      {
        "name": "鹿追町",
        "latitude": 43.0989,
        "longitude": 142.989
      },
      {
        "name": "新得町",
        "latitude": 43.0795,
        "longitude": 142.839
      },
      {
        "name": "清水町",
        "latitude": 43.0114,
        "longitude": 142.8845
      },
      {
        "name": "芽室町",
        "latitude": 42.9115,
        "longitude": 143.0508
      },
      {
        "name": "中札内村",
        "latitude": 42.6979,
        "longitude": 143.1344
      },
      {
        "name": "更別村",
        "latitude": 42.6504,
        "longitude": 143.1878
      },
      {
        "name": "大樹町",
        "latitude": 42.4977,
        "longitude": 143.279
      },
      {
        "name": "広尾町",
        "latitude": 42.2859,
        "longitude": 143.3116
      },
      {
        "name": "幕別町",
        "latitude": 42.9086,
        "longitude": 143.3561
      },
      {
        "name": "池田町",
        "latitude": 42.929,
        "longitude": 143.4485
      },
      {
        "name": "豊頃町",
        "latitude": 42.801,
        "longitude": 143.5059
      },
      {
        "name": "本別町",
        "latitude": 43.1247,
        "longitude": 143.6106
      },
      {
        "name": "足寄町",
        "latitude": 43.2448,
        "longitude": 143.554
      },
      {
        "name": "陸別町",
        "latitude": 43.4689,
        "longitude": 143.7472
      },
      {
        "name": "浦幌町",
        "latitude": 42.809,
        "longitude": 143.6586
      },
      {
        "name": "釧路町",
        "latitude": 42.9962,
        "longitude": 144.4661
      },
      {
        "name": "厚岸町",
        "latitude": 43.052,
        "longitude": 144.8475
      },
      {
        "name": "浜中町",
        "latitude": 43.0759,
        "longitude": 145.1311
      },
      {
        "name": "標茶町",
        "latitude": 43.3033,
        "longitude": 144.6007
      },
      {
        "name": "弟子屈町",
        "latitude": 43.4852,
        "longitude": 144.4593
      },
      {
        "name": "鶴居村",
        "latitude": 43.2301,
        "longitude": 144.3212
      },
      {
        "name": "白糠町",
        "latitude": 42.9562,
        "longitude": 144.0717
      },
      {
        "name": "別海町",
        "latitude": 43.394,
        "longitude": 145.1173
      },
      {
        "name": "中標津町",
        "latitude": 43.5552,
        "longitude": 144.9714
      },
      {
        "name": "標津町",
        "latitude": 43.6613,
        "longitude": 145.1313
      },
      {
        "name": "羅臼町",
        "latitude": 44.0219,
        "longitude": 145.1894
      },
      {
        "name": "色丹村",
        "latitude": 43.0643,
        "longitude": 141.3469
      },
      {
        "name": "泊村",
        "latitude": 43.063,
        "longitude": 140.4989
      },
      {
        "name": "留夜別村",
        "latitude": 42.7373,
        "longitude": 140.8756
      },
      {
        "name": "留別村",
        "latitude": 42.7373,
        "longitude": 140.8756
      },
      {
        "name": "紗那村",
        "latitude": 43.0643,
        "longitude": 141.3469
      },
      {
        "name": "蘂取村",
        "latitude": 43.0643,
        "longitude": 141.3469
      },
      {
        "name": "札幌市中央区",
        "latitude": 43.0555,
        "longitude": 141.3411
      },
      {
        "name": "札幌市北区",
        "latitude": 43.0908,
        "longitude": 141.341
      },
      {
        "name": "札幌市東区",
        "latitude": 43.0761,
        "longitude": 141.3636
      },
      {
        "name": "札幌市白石区",
        "latitude": 43.0456,
        "longitude": 141.3964
      },
      {
        "name": "札幌市豊平区",
        "latitude": 43.0313,
        "longitude": 141.3801
      },
      {
        "name": "札幌市南区",
        "latitude": 42.99,
        "longitude": 141.3535
      },
      {
        "name": "札幌市西区",
        "latitude": 43.0745,
        "longitude": 141.3009
      },
      {
        "name": "札幌市厚別区",
        "latitude": 43.0364,
        "longitude": 141.4748
      },
      {
        "name": "札幌市手稲区",
        "latitude": 43.1219,
        "longitude": 141.2458
      },
      {
        "name": "札幌市清田区",
        "latitude": 42.9996,
        "longitude": 141.4438
      }
    ]
  },
  {
    "prefecture": "青森県",
    "municipalities": [
      {
        "name": "青森市",
        "latitude": 40.8226,
        "longitude": 140.747
      },
      {
        "name": "弘前市",
        "latitude": 40.6031,
        "longitude": 140.464
      },
      {
        "name": "八戸市",
        "latitude": 40.5123,
        "longitude": 141.4884
      },
      {
        "name": "黒石市",
        "latitude": 40.6427,
        "longitude": 140.5946
      },
      {
        "name": "五所川原市",
        "latitude": 40.8077,
        "longitude": 140.4461
      },
      {
        "name": "十和田市",
        "latitude": 40.6125,
        "longitude": 141.2054
      },
      {
        "name": "三沢市",
        "latitude": 40.6831,
        "longitude": 141.3691
      },
      {
        "name": "むつ市",
        "latitude": 41.2931,
        "longitude": 141.1831
      },
      {
        "name": "つがる市",
        "latitude": 40.8087,
        "longitude": 140.3802
      },
      {
        "name": "平川市",
        "latitude": 40.5837,
        "longitude": 140.5671
      },
      {
        "name": "平内町",
        "latitude": 40.9261,
        "longitude": 140.9559
      },
      {
        "name": "今別町",
        "latitude": 41.1819,
        "longitude": 140.4817
      },
      {
        "name": "蓬田村",
        "latitude": 40.9718,
        "longitude": 140.6561
      },
      {
        "name": "外ヶ浜町",
        "latitude": 41.0433,
        "longitude": 140.6324
      },
      {
        "name": "鰺ヶ沢町",
        "latitude": 40.783,
        "longitude": 140.2339
      },
      {
        "name": "深浦町",
        "latitude": 40.6479,
        "longitude": 139.9276
      },
      {
        "name": "西目屋村",
        "latitude": 40.5775,
        "longitude": 140.2973
      },
      {
        "name": "藤崎町",
        "latitude": 40.6561,
        "longitude": 140.5028
      },
      {
        "name": "大鰐町",
        "latitude": 40.5183,
        "longitude": 140.5678
      },
      {
        "name": "田舎館村",
        "latitude": 40.6312,
        "longitude": 140.5502
      },
      {
        "name": "板柳町",
        "latitude": 40.696,
        "longitude": 140.4577
      },
      {
        "name": "鶴田町",
        "latitude": 40.7588,
        "longitude": 140.4287
      },
      {
        "name": "中泊町",
        "latitude": 40.9604,
        "longitude": 140.434
      },
      {
        "name": "野辺地町",
        "latitude": 40.8644,
        "longitude": 141.1279
      },
      {
        "name": "七戸町",
        "latitude": 40.7447,
        "longitude": 141.1578
      },
      {
        "name": "六戸町",
        "latitude": 40.6095,
        "longitude": 141.325
      },
      {
        "name": "横浜町",
        "latitude": 41.0833,
        "longitude": 141.2475
      },
      {
        "name": "東北町",
        "latitude": 40.7279,
        "longitude": 141.2577
      },
      {
        "name": "六ヶ所村",
        "latitude": 40.9673,
        "longitude": 141.3746
      },
      {
        "name": "おいらせ町",
        "latitude": 40.5992,
        "longitude": 141.3977
      },
      {
        "name": "大間町",
        "latitude": 41.5224,
        "longitude": 140.9048
      },
      {
        "name": "東通村",
        "latitude": 41.2777,
        "longitude": 141.329
      },
      {
        "name": "風間浦村",
        "latitude": 41.4876,
        "longitude": 140.9957
      },
      {
        "name": "佐井村",
        "latitude": 41.4297,
        "longitude": 140.8592
      },
      {
        "name": "三戸町",
        "latitude": 40.3784,
        "longitude": 141.2587
      },
      {
        "name": "五戸町",
        "latitude": 40.5311,
        "longitude": 141.3078
      },
      {
        "name": "田子町",
        "latitude": 40.3401,
        "longitude": 141.1522
      },
      {
        "name": "南部町",
        "latitude": 40.4203,
        "longitude": 141.3303
      },
      {
        "name": "階上町",
        "latitude": 40.4524,
        "longitude": 141.6211
      },
      {
        "name": "新郷村",
        "latitude": 40.4658,
        "longitude": 141.1733
      }
    ]
  },
  {
    "prefecture": "岩手県",
    "municipalities": [
      {
        "name": "盛岡市",
        "latitude": 39.7021,
        "longitude": 141.1545
      },
      {
        "name": "宮古市",
        "latitude": 39.6396,
        "longitude": 141.9461
      },
      {
        "name": "大船渡市",
        "latitude": 39.0819,
        "longitude": 141.7085
      },
      {
        "name": "花巻市",
        "latitude": 39.3886,
        "longitude": 141.1169
      },
      {
        "name": "北上市",
        "latitude": 39.2868,
        "longitude": 141.1132
      },
      {
        "name": "久慈市",
        "latitude": 40.1904,
        "longitude": 141.7757
      },
      {
        "name": "遠野市",
        "latitude": 39.3307,
        "longitude": 141.5314
      },
      {
        "name": "一関市",
        "latitude": 38.9347,
        "longitude": 141.1266
      },
      {
        "name": "陸前高田市",
        "latitude": 39.0204,
        "longitude": 141.6332
      },
      {
        "name": "釜石市",
        "latitude": 39.2758,
        "longitude": 141.8857
      },
      {
        "name": "二戸市",
        "latitude": 40.2712,
        "longitude": 141.3048
      },
      {
        "name": "八幡平市",
        "latitude": 39.9565,
        "longitude": 141.0712
      },
      {
        "name": "奥州市",
        "latitude": 39.1445,
        "longitude": 141.1391
      },
      {
        "name": "滝沢市",
        "latitude": 39.7348,
        "longitude": 141.0771
      },
      {
        "name": "雫石町",
        "latitude": 39.6963,
        "longitude": 140.9757
      },
      {
        "name": "葛巻町",
        "latitude": 40.04,
        "longitude": 141.4379
      },
      {
        "name": "岩手町",
        "latitude": 39.9726,
        "longitude": 141.2126
      },
      {
        "name": "紫波町",
        "latitude": 39.5545,
        "longitude": 141.1557
      },
      {
        "name": "矢巾町",
        "latitude": 39.606,
        "longitude": 141.143
      },
      {
        "name": "西和賀町",
        "latitude": 39.318,
        "longitude": 140.7789
      },
      {
        "name": "金ケ崎町",
        "latitude": 39.1957,
        "longitude": 141.1163
      },
      {
        "name": "平泉町",
        "latitude": 38.9866,
        "longitude": 141.1138
      },
      {
        "name": "住田町",
        "latitude": 39.1422,
        "longitude": 141.575
      },
      {
        "name": "大槌町",
        "latitude": 39.3582,
        "longitude": 141.8995
      },
      {
        "name": "山田町",
        "latitude": 39.4676,
        "longitude": 141.9491
      },
      {
        "name": "岩泉町",
        "latitude": 39.8431,
        "longitude": 141.7964
      },
      {
        "name": "田野畑村",
        "latitude": 39.9305,
        "longitude": 141.8889
      },
      {
        "name": "普代村",
        "latitude": 40.0053,
        "longitude": 141.8861
      },
      {
        "name": "軽米町",
        "latitude": 40.3267,
        "longitude": 141.4603
      },
      {
        "name": "野田村",
        "latitude": 40.1103,
        "longitude": 141.8178
      },
      {
        "name": "九戸村",
        "latitude": 40.2114,
        "longitude": 141.4189
      },
      {
        "name": "洋野町",
        "latitude": 40.4083,
        "longitude": 141.7186
      },
      {
        "name": "一戸町",
        "latitude": 40.213,
        "longitude": 141.2955
      }
    ]
  },
  {
    "prefecture": "宮城県",
    "municipalities": [
      {
        "name": "仙台市",
        "latitude": 38.2682,
        "longitude": 140.8695
      },
      {
        "name": "石巻市",
        "latitude": 38.4343,
        "longitude": 141.3027
      },
      {
        "name": "塩竈市",
        "latitude": 38.3143,
        "longitude": 141.0221
      },
      {
        "name": "気仙沼市",
        "latitude": 38.9081,
        "longitude": 141.5701
      },
      {
        "name": "白石市",
        "latitude": 38.0024,
        "longitude": 140.6199
      },
      {
        "name": "名取市",
        "latitude": 38.1714,
        "longitude": 140.892
      },
      {
        "name": "角田市",
        "latitude": 37.977,
        "longitude": 140.7817
      },
      {
        "name": "多賀城市",
        "latitude": 38.2938,
        "longitude": 141.0044
      },
      {
        "name": "岩沼市",
        "latitude": 38.1043,
        "longitude": 140.8702
      },
      {
        "name": "登米市",
        "latitude": 38.6919,
        "longitude": 141.1877
      },
      {
        "name": "栗原市",
        "latitude": 38.7301,
        "longitude": 141.0213
      },
      {
        "name": "東松島市",
        "latitude": 38.4263,
        "longitude": 141.2106
      },
      {
        "name": "大崎市",
        "latitude": 38.5775,
        "longitude": 140.9557
      },
      {
        "name": "富谷市",
        "latitude": 38.3999,
        "longitude": 140.8954
      },
      {
        "name": "蔵王町",
        "latitude": 38.098,
        "longitude": 140.6588
      },
      {
        "name": "七ヶ宿町",
        "latitude": 37.993,
        "longitude": 140.4417
      },
      {
        "name": "大河原町",
        "latitude": 38.0494,
        "longitude": 140.7309
      },
      {
        "name": "村田町",
        "latitude": 38.1185,
        "longitude": 140.7224
      },
      {
        "name": "柴田町",
        "latitude": 38.0566,
        "longitude": 140.7659
      },
      {
        "name": "川崎町",
        "latitude": 38.1778,
        "longitude": 140.6432
      },
      {
        "name": "丸森町",
        "latitude": 37.9115,
        "longitude": 140.7654
      },
      {
        "name": "亘理町",
        "latitude": 38.0443,
        "longitude": 140.8679
      },
      {
        "name": "山元町",
        "latitude": 37.9627,
        "longitude": 140.8781
      },
      {
        "name": "松島町",
        "latitude": 38.3802,
        "longitude": 141.0674
      },
      {
        "name": "七ヶ浜町",
        "latitude": 38.3046,
        "longitude": 141.0592
      },
      {
        "name": "利府町",
        "latitude": 38.3303,
        "longitude": 140.9756
      },
      {
        "name": "大和町",
        "latitude": 38.4374,
        "longitude": 140.8864
      },
      {
        "name": "大郷町",
        "latitude": 38.4243,
        "longitude": 141.0045
      },
      {
        "name": "大衡村",
        "latitude": 38.4672,
        "longitude": 140.8799
      },
      {
        "name": "色麻町",
        "latitude": 38.5489,
        "longitude": 140.85
      },
      {
        "name": "加美町",
        "latitude": 38.5717,
        "longitude": 140.8549
      },
      {
        "name": "涌谷町",
        "latitude": 38.5397,
        "longitude": 141.1282
      },
      {
        "name": "美里町",
        "latitude": 38.5444,
        "longitude": 141.0568
      },
      {
        "name": "女川町",
        "latitude": 38.4455,
        "longitude": 141.4431
      },
      {
        "name": "南三陸町",
        "latitude": 38.6807,
        "longitude": 141.4625
      },
      {
        "name": "仙台市青葉区",
        "latitude": 38.2691,
        "longitude": 140.8705
      },
      {
        "name": "仙台市宮城野区",
        "latitude": 38.2662,
        "longitude": 140.91
      },
      {
        "name": "仙台市若林区",
        "latitude": 38.2442,
        "longitude": 140.9009
      },
      {
        "name": "仙台市太白区",
        "latitude": 38.2244,
        "longitude": 140.8772
      },
      {
        "name": "仙台市泉区",
        "latitude": 38.3263,
        "longitude": 140.8813
      }
    ]
  },
  {
    "prefecture": "秋田県",
    "municipalities": [
      {
        "name": "秋田市",
        "latitude": 39.72,
        "longitude": 140.1035
      },
      {
        "name": "能代市",
        "latitude": 40.2119,
        "longitude": 140.0271
      },
      {
        "name": "横手市",
        "latitude": 39.3138,
        "longitude": 140.5667
      },
      {
        "name": "大館市",
        "latitude": 40.2717,
        "longitude": 140.5652
      },
      {
        "name": "男鹿市",
        "latitude": 39.8868,
        "longitude": 139.8475
      },
      {
        "name": "湯沢市",
        "latitude": 39.1643,
        "longitude": 140.4957
      },
      {
        "name": "鹿角市",
        "latitude": 40.2158,
        "longitude": 140.7885
      },
      {
        "name": "由利本荘市",
        "latitude": 39.3858,
        "longitude": 140.0489
      },
      {
        "name": "潟上市",
        "latitude": 39.8572,
        "longitude": 140.013
      },
      {
        "name": "大仙市",
        "latitude": 39.453,
        "longitude": 140.4756
      },
      {
        "name": "北秋田市",
        "latitude": 40.2261,
        "longitude": 140.3707
      },
      {
        "name": "にかほ市",
        "latitude": 39.203,
        "longitude": 139.9078
      },
      {
        "name": "仙北市",
        "latitude": 39.7,
        "longitude": 140.7306
      },
      {
        "name": "小坂町",
        "latitude": 40.3331,
        "longitude": 140.7361
      },
      {
        "name": "上小阿仁村",
        "latitude": 40.0633,
        "longitude": 140.2957
      },
      {
        "name": "藤里町",
        "latitude": 40.2783,
        "longitude": 140.2617
      },
      {
        "name": "三種町",
        "latitude": 40.1017,
        "longitude": 140.005
      },
      {
        "name": "八峰町",
        "latitude": 40.3186,
        "longitude": 140.0386
      },
      {
        "name": "五城目町",
        "latitude": 39.9439,
        "longitude": 140.1116
      },
      {
        "name": "八郎潟町",
        "latitude": 39.949,
        "longitude": 140.0734
      },
      {
        "name": "井川町",
        "latitude": 39.9141,
        "longitude": 140.0815
      },
      {
        "name": "大潟村",
        "latitude": 40.0178,
        "longitude": 139.96
      },
      {
        "name": "美郷町",
        "latitude": 39.4616,
        "longitude": 140.5821
      },
      {
        "name": "羽後町",
        "latitude": 39.1993,
        "longitude": 140.413
      },
      {
        "name": "東成瀬村",
        "latitude": 39.179,
        "longitude": 140.649
      }
    ]
  },
  {
    "prefecture": "山形県",
    "municipalities": [
      {
        "name": "山形市",
        "latitude": 38.2555,
        "longitude": 140.3398
      },
      {
        "name": "米沢市",
        "latitude": 37.9219,
        "longitude": 140.1161
      },
      {
        "name": "鶴岡市",
        "latitude": 38.7272,
        "longitude": 139.8267
      },
      {
        "name": "酒田市",
        "latitude": 38.9146,
        "longitude": 139.8365
      },
      {
        "name": "新庄市",
        "latitude": 38.765,
        "longitude": 140.3016
      },
      {
        "name": "寒河江市",
        "latitude": 38.381,
        "longitude": 140.2762
      },
      {
        "name": "上山市",
        "latitude": 38.1496,
        "longitude": 140.2679
      },
      {
        "name": "村山市",
        "latitude": 38.4834,
        "longitude": 140.3804
      },
      {
        "name": "長井市",
        "latitude": 38.1061,
        "longitude": 140.034
      },
      {
        "name": "天童市",
        "latitude": 38.3622,
        "longitude": 140.3779
      },
      {
        "name": "東根市",
        "latitude": 38.4314,
        "longitude": 140.3911
      },
      {
        "name": "尾花沢市",
        "latitude": 38.6011,
        "longitude": 140.4068
      },
      {
        "name": "南陽市",
        "latitude": 38.0551,
        "longitude": 140.1484
      },
      {
        "name": "山辺町",
        "latitude": 38.2892,
        "longitude": 140.2623
      },
      {
        "name": "中山町",
        "latitude": 38.3332,
        "longitude": 140.2831
      },
      {
        "name": "河北町",
        "latitude": 38.4266,
        "longitude": 140.3146
      },
      {
        "name": "西川町",
        "latitude": 38.4265,
        "longitude": 140.1474
      },
      {
        "name": "朝日町",
        "latitude": 38.2992,
        "longitude": 140.1459
      },
      {
        "name": "大江町",
        "latitude": 38.3807,
        "longitude": 140.2068
      },
      {
        "name": "大石田町",
        "latitude": 38.5938,
        "longitude": 140.3727
      },
      {
        "name": "金山町",
        "latitude": 38.8834,
        "longitude": 140.3394
      },
      {
        "name": "最上町",
        "latitude": 38.7585,
        "longitude": 140.5193
      },
      {
        "name": "舟形町",
        "latitude": 38.6915,
        "longitude": 140.3202
      },
      {
        "name": "真室川町",
        "latitude": 38.8569,
        "longitude": 140.2516
      },
      {
        "name": "大蔵村",
        "latitude": 38.7041,
        "longitude": 140.2304
      },
      {
        "name": "鮭川村",
        "latitude": 38.7964,
        "longitude": 140.222
      },
      {
        "name": "戸沢村",
        "latitude": 38.7376,
        "longitude": 140.1436
      },
      {
        "name": "高畠町",
        "latitude": 38.0027,
        "longitude": 140.1892
      },
      {
        "name": "川西町",
        "latitude": 38.0052,
        "longitude": 140.0532
      },
      {
        "name": "小国町",
        "latitude": 38.0616,
        "longitude": 139.7434
      },
      {
        "name": "白鷹町",
        "latitude": 38.1836,
        "longitude": 140.0982
      },
      {
        "name": "飯豊町",
        "latitude": 38.0457,
        "longitude": 139.9876
      },
      {
        "name": "三川町",
        "latitude": 38.7945,
        "longitude": 139.8497
      },
      {
        "name": "庄内町",
        "latitude": 38.8496,
        "longitude": 139.904
      },
      {
        "name": "遊佐町",
        "latitude": 39.0148,
        "longitude": 139.9087
      }
    ]
  },
  {
    "prefecture": "福島県",
    "municipalities": [
      {
        "name": "福島市",
        "latitude": 37.7608,
        "longitude": 140.4747
      },
      {
        "name": "会津若松市",
        "latitude": 37.4901,
        "longitude": 139.928
      },
      {
        "name": "郡山市",
        "latitude": 37.4004,
        "longitude": 140.3596
      },
      {
        "name": "いわき市",
        "latitude": 37.0505,
        "longitude": 140.8877
      },
      {
        "name": "白河市",
        "latitude": 37.1263,
        "longitude": 140.211
      },
      {
        "name": "須賀川市",
        "latitude": 37.2869,
        "longitude": 140.3726
      },
      {
        "name": "喜多方市",
        "latitude": 37.6513,
        "longitude": 139.8747
      },
      {
        "name": "相馬市",
        "latitude": 37.7973,
        "longitude": 140.9189
      },
      {
        "name": "二本松市",
        "latitude": 37.5849,
        "longitude": 140.4312
      },
      {
        "name": "田村市",
        "latitude": 37.4406,
        "longitude": 140.5763
      },
      {
        "name": "南相馬市",
        "latitude": 37.6422,
        "longitude": 140.9574
      },
      {
        "name": "伊達市",
        "latitude": 37.8191,
        "longitude": 140.563
      },
      {
        "name": "本宮市",
        "latitude": 37.5132,
        "longitude": 140.3939
      },
      {
        "name": "桑折町",
        "latitude": 37.8547,
        "longitude": 140.5208
      },
      {
        "name": "国見町",
        "latitude": 37.8768,
        "longitude": 140.5493
      },
      {
        "name": "川俣町",
        "latitude": 37.6651,
        "longitude": 140.5983
      },
      {
        "name": "大玉村",
        "latitude": 37.5344,
        "longitude": 140.3711
      },
      {
        "name": "鏡石町",
        "latitude": 37.2528,
        "longitude": 140.3434
      },
      {
        "name": "天栄村",
        "latitude": 37.2554,
        "longitude": 140.2472
      },
      {
        "name": "下郷町",
        "latitude": 37.2556,
        "longitude": 139.8722
      },
      {
        "name": "檜枝岐村",
        "latitude": 37.0242,
        "longitude": 139.389
      },
      {
        "name": "只見町",
        "latitude": 37.3487,
        "longitude": 139.3158
      },
      {
        "name": "南会津町",
        "latitude": 37.2004,
        "longitude": 139.7739
      },
      {
        "name": "北塩原村",
        "latitude": 37.6557,
        "longitude": 139.9376
      },
      {
        "name": "西会津町",
        "latitude": 37.5874,
        "longitude": 139.6493
      },
      {
        "name": "磐梯町",
        "latitude": 37.5621,
        "longitude": 139.9887
      },
      {
        "name": "猪苗代町",
        "latitude": 37.5578,
        "longitude": 140.1047
      },
      {
        "name": "会津坂下町",
        "latitude": 37.5615,
        "longitude": 139.8217
      },
      {
        "name": "湯川村",
        "latitude": 37.5653,
        "longitude": 139.8869
      },
      {
        "name": "柳津町",
        "latitude": 37.5261,
        "longitude": 139.7196
      },
      {
        "name": "三島町",
        "latitude": 37.4703,
        "longitude": 139.6445
      },
      {
        "name": "金山町",
        "latitude": 37.4537,
        "longitude": 139.5246
      },
      {
        "name": "昭和村",
        "latitude": 37.3355,
        "longitude": 139.6107
      },
      {
        "name": "会津美里町",
        "latitude": 37.4652,
        "longitude": 139.8346
      },
      {
        "name": "西郷村",
        "latitude": 37.1418,
        "longitude": 140.1554
      },
      {
        "name": "泉崎村",
        "latitude": 37.1538,
        "longitude": 140.3033
      },
      {
        "name": "中島村",
        "latitude": 37.1488,
        "longitude": 140.3502
      },
      {
        "name": "矢吹町",
        "latitude": 37.2012,
        "longitude": 140.3386
      },
      {
        "name": "棚倉町",
        "latitude": 37.0299,
        "longitude": 140.3797
      },
      {
        "name": "矢祭町",
        "latitude": 36.8713,
        "longitude": 140.4248
      },
      {
        "name": "塙町",
        "latitude": 36.9569,
        "longitude": 140.4098
      },
      {
        "name": "鮫川村",
        "latitude": 37.0424,
        "longitude": 140.5097
      },
      {
        "name": "石川町",
        "latitude": 37.1571,
        "longitude": 140.4467
      },
      {
        "name": "玉川村",
        "latitude": 37.2107,
        "longitude": 140.409
      },
      {
        "name": "平田村",
        "latitude": 37.222,
        "longitude": 140.5757
      },
      {
        "name": "浅川町",
        "latitude": 37.081,
        "longitude": 140.4128
      },
      {
        "name": "古殿町",
        "latitude": 37.0892,
        "longitude": 140.5558
      },
      {
        "name": "三春町",
        "latitude": 37.4405,
        "longitude": 140.4934
      },
      {
        "name": "小野町",
        "latitude": 37.2869,
        "longitude": 140.6263
      },
      {
        "name": "広野町",
        "latitude": 37.2144,
        "longitude": 140.9946
      },
      {
        "name": "楢葉町",
        "latitude": 37.2826,
        "longitude": 140.9935
      },
      {
        "name": "富岡町",
        "latitude": 37.3455,
        "longitude": 141.0087
      },
      {
        "name": "川内村",
        "latitude": 37.3376,
        "longitude": 140.8094
      },
      {
        "name": "大熊町",
        "latitude": 37.3818,
        "longitude": 140.9584
      },
      {
        "name": "双葉町",
        "latitude": 37.4529,
        "longitude": 141.0064
      },
      {
        "name": "浪江町",
        "latitude": 37.4945,
        "longitude": 141.0007
      },
      {
        "name": "葛尾村",
        "latitude": 37.5035,
        "longitude": 140.7643
      },
      {
        "name": "新地町",
        "latitude": 37.8763,
        "longitude": 140.9196
      },
      {
        "name": "飯舘村",
        "latitude": 37.679,
        "longitude": 140.7352
      }
    ]
  },
  {
    "prefecture": "茨城県",
    "municipalities": [
      {
        "name": "水戸市",
        "latitude": 36.3659,
        "longitude": 140.4716
      },
      {
        "name": "日立市",
        "latitude": 36.5992,
        "longitude": 140.6506
      },
      {
        "name": "土浦市",
        "latitude": 36.0784,
        "longitude": 140.2042
      },
      {
        "name": "古河市",
        "latitude": 36.1782,
        "longitude": 139.755
      },
      {
        "name": "石岡市",
        "latitude": 36.1905,
        "longitude": 140.287
      },
      {
        "name": "結城市",
        "latitude": 36.2896,
        "longitude": 139.8715
      },
      {
        "name": "龍ケ崎市",
        "latitude": 35.9117,
        "longitude": 140.1822
      },
      {
        "name": "下妻市",
        "latitude": 36.1844,
        "longitude": 139.9682
      },
      {
        "name": "常総市",
        "latitude": 36.0235,
        "longitude": 139.9937
      },
      {
        "name": "常陸太田市",
        "latitude": 36.5383,
        "longitude": 140.5311
      },
      {
        "name": "高萩市",
        "latitude": 36.7137,
        "longitude": 140.7095
      },
      {
        "name": "北茨城市",
        "latitude": 36.8019,
        "longitude": 140.751
      },
      {
        "name": "笠間市",
        "latitude": 36.3452,
        "longitude": 140.3043
      },
      {
        "name": "取手市",
        "latitude": 35.9115,
        "longitude": 140.0504
      },
      {
        "name": "牛久市",
        "latitude": 35.9794,
        "longitude": 140.1496
      },
      {
        "name": "つくば市",
        "latitude": 36.0836,
        "longitude": 140.0764
      },
      {
        "name": "ひたちなか市",
        "latitude": 36.3967,
        "longitude": 140.5347
      },
      {
        "name": "鹿嶋市",
        "latitude": 35.9657,
        "longitude": 140.6448
      },
      {
        "name": "潮来市",
        "latitude": 35.9471,
        "longitude": 140.5554
      },
      {
        "name": "守谷市",
        "latitude": 35.9514,
        "longitude": 139.9756
      },
      {
        "name": "常陸大宮市",
        "latitude": 36.5425,
        "longitude": 140.4108
      },
      {
        "name": "那珂市",
        "latitude": 36.4574,
        "longitude": 140.4868
      },
      {
        "name": "筑西市",
        "latitude": 36.3053,
        "longitude": 139.9794
      },
      {
        "name": "坂東市",
        "latitude": 36.0482,
        "longitude": 139.8889
      },
      {
        "name": "稲敷市",
        "latitude": 35.973,
        "longitude": 140.3036
      },
      {
        "name": "かすみがうら市",
        "latitude": 36.1518,
        "longitude": 140.2371
      },
      {
        "name": "桜川市",
        "latitude": 36.3273,
        "longitude": 140.0906
      },
      {
        "name": "神栖市",
        "latitude": 35.89,
        "longitude": 140.6646
      },
      {
        "name": "行方市",
        "latitude": 35.9905,
        "longitude": 140.489
      },
      {
        "name": "鉾田市",
        "latitude": 36.1586,
        "longitude": 140.5164
      },
      {
        "name": "つくばみらい市",
        "latitude": 35.9627,
        "longitude": 140.0367
      },
      {
        "name": "小美玉市",
        "latitude": 36.2393,
        "longitude": 140.3526
      },
      {
        "name": "茨城町",
        "latitude": 36.2869,
        "longitude": 140.4247
      },
      {
        "name": "大洗町",
        "latitude": 36.3133,
        "longitude": 140.5749
      },
      {
        "name": "城里町",
        "latitude": 36.4792,
        "longitude": 140.3763
      },
      {
        "name": "東海村",
        "latitude": 36.4729,
        "longitude": 140.5662
      },
      {
        "name": "大子町",
        "latitude": 36.7644,
        "longitude": 140.3634
      },
      {
        "name": "美浦村",
        "latitude": 36.0046,
        "longitude": 140.302
      },
      {
        "name": "阿見町",
        "latitude": 36.0308,
        "longitude": 140.215
      },
      {
        "name": "河内町",
        "latitude": 35.8847,
        "longitude": 140.2444
      },
      {
        "name": "八千代町",
        "latitude": 36.1816,
        "longitude": 139.8912
      },
      {
        "name": "五霞町",
        "latitude": 36.1141,
        "longitude": 139.746
      },
      {
        "name": "境町",
        "latitude": 36.1085,
        "longitude": 139.795
      },
      {
        "name": "利根町",
        "latitude": 35.8578,
        "longitude": 140.1391
      }
    ]
  },
  {
    "prefecture": "栃木県",
    "municipalities": [
      {
        "name": "宇都宮市",
        "latitude": 36.5551,
        "longitude": 139.8826
      },
      {
        "name": "足利市",
        "latitude": 36.3401,
        "longitude": 139.4498
      },
      {
        "name": "栃木市",
        "latitude": 36.3824,
        "longitude": 139.7341
      },
      {
        "name": "佐野市",
        "latitude": 36.3145,
        "longitude": 139.5784
      },
      {
        "name": "鹿沼市",
        "latitude": 36.5667,
        "longitude": 139.745
      },
      {
        "name": "日光市",
        "latitude": 36.72,
        "longitude": 139.6976
      },
      {
        "name": "小山市",
        "latitude": 36.3145,
        "longitude": 139.8008
      },
      {
        "name": "真岡市",
        "latitude": 36.4405,
        "longitude": 140.0125
      },
      {
        "name": "大田原市",
        "latitude": 36.8709,
        "longitude": 140.0158
      },
      {
        "name": "矢板市",
        "latitude": 36.8067,
        "longitude": 139.9242
      },
      {
        "name": "那須塩原市",
        "latitude": 36.9617,
        "longitude": 140.0461
      },
      {
        "name": "さくら市",
        "latitude": 36.6853,
        "longitude": 139.9664
      },
      {
        "name": "那須烏山市",
        "latitude": 36.6569,
        "longitude": 140.1515
      },
      {
        "name": "下野市",
        "latitude": 36.3953,
        "longitude": 139.852
      },
      {
        "name": "上三川町",
        "latitude": 36.4393,
        "longitude": 139.9099
      },
      {
        "name": "益子町",
        "latitude": 36.4674,
        "longitude": 140.0934
      },
      {
        "name": "茂木町",
        "latitude": 36.5321,
        "longitude": 140.1876
      },
      {
        "name": "市貝町",
        "latitude": 36.5432,
        "longitude": 140.1021
      },
      {
        "name": "芳賀町",
        "latitude": 36.5483,
        "longitude": 140.0582
      },
      {
        "name": "壬生町",
        "latitude": 36.4422,
        "longitude": 139.8147
      },
      {
        "name": "野木町",
        "latitude": 36.2332,
        "longitude": 139.7408
      },
      {
        "name": "塩谷町",
        "latitude": 36.7789,
        "longitude": 139.8569
      },
      {
        "name": "高根沢町",
        "latitude": 36.631,
        "longitude": 139.9867
      },
      {
        "name": "那須町",
        "latitude": 37.0198,
        "longitude": 140.121
      },
      {
        "name": "那珂川町",
        "latitude": 36.7363,
        "longitude": 140.1723
      }
    ]
  },
  {
    "prefecture": "群馬県",
    "municipalities": [
      {
        "name": "前橋市",
        "latitude": 36.3895,
        "longitude": 139.0635
      },
      {
        "name": "高崎市",
        "latitude": 36.322,
        "longitude": 139.0033
      },
      {
        "name": "桐生市",
        "latitude": 36.4057,
        "longitude": 139.3308
      },
      {
        "name": "伊勢崎市",
        "latitude": 36.3114,
        "longitude": 139.1967
      },
      {
        "name": "太田市",
        "latitude": 36.2912,
        "longitude": 139.3755
      },
      {
        "name": "沼田市",
        "latitude": 36.644,
        "longitude": 139.0428
      },
      {
        "name": "館林市",
        "latitude": 36.2448,
        "longitude": 139.5423
      },
      {
        "name": "渋川市",
        "latitude": 36.4894,
        "longitude": 139.0006
      },
      {
        "name": "藤岡市",
        "latitude": 36.2586,
        "longitude": 139.0747
      },
      {
        "name": "富岡市",
        "latitude": 36.2598,
        "longitude": 138.8895
      },
      {
        "name": "安中市",
        "latitude": 36.3264,
        "longitude": 138.8872
      },
      {
        "name": "みどり市",
        "latitude": 36.3948,
        "longitude": 139.2811
      },
      {
        "name": "榛東村",
        "latitude": 36.4385,
        "longitude": 138.9672
      },
      {
        "name": "吉岡町",
        "latitude": 36.4474,
        "longitude": 139.0097
      },
      {
        "name": "上野村",
        "latitude": 36.0832,
        "longitude": 138.7773
      },
      {
        "name": "神流町",
        "latitude": 36.116,
        "longitude": 138.917
      },
      {
        "name": "下仁田町",
        "latitude": 36.2125,
        "longitude": 138.7892
      },
      {
        "name": "南牧村",
        "latitude": 36.1586,
        "longitude": 138.7114
      },
      {
        "name": "甘楽町",
        "latitude": 36.243,
        "longitude": 138.9218
      },
      {
        "name": "中之条町",
        "latitude": 36.5899,
        "longitude": 138.841
      },
      {
        "name": "長野原町",
        "latitude": 36.5443,
        "longitude": 138.6498
      },
      {
        "name": "嬬恋村",
        "latitude": 36.5167,
        "longitude": 138.5303
      },
      {
        "name": "草津町",
        "latitude": 36.6206,
        "longitude": 138.5961
      },
      {
        "name": "高山村",
        "latitude": 36.6208,
        "longitude": 138.9436
      },
      {
        "name": "東吾妻町",
        "latitude": 36.5715,
        "longitude": 138.8205
      },
      {
        "name": "片品村",
        "latitude": 36.7723,
        "longitude": 139.2253
      },
      {
        "name": "川場村",
        "latitude": 36.6926,
        "longitude": 139.1035
      },
      {
        "name": "昭和村",
        "latitude": 36.6397,
        "longitude": 139.0663
      },
      {
        "name": "みなかみ町",
        "latitude": 36.6787,
        "longitude": 138.9991
      },
      {
        "name": "玉村町",
        "latitude": 36.3044,
        "longitude": 139.115
      },
      {
        "name": "板倉町",
        "latitude": 36.226,
        "longitude": 139.6019
      },
      {
        "name": "明和町",
        "latitude": 36.2112,
        "longitude": 139.5343
      },
      {
        "name": "千代田町",
        "latitude": 36.2178,
        "longitude": 139.4425
      },
      {
        "name": "大泉町",
        "latitude": 36.2479,
        "longitude": 139.4048
      },
      {
        "name": "邑楽町",
        "latitude": 36.2525,
        "longitude": 139.4625
      }
    ]
  },
  {
    "prefecture": "埼玉県",
    "municipalities": [
      {
        "name": "さいたま市",
        "latitude": 35.8617,
        "longitude": 139.6457
      },
      {
        "name": "川越市",
        "latitude": 35.9251,
        "longitude": 139.4858
      },
      {
        "name": "熊谷市",
        "latitude": 36.1472,
        "longitude": 139.3886
      },
      {
        "name": "川口市",
        "latitude": 35.8067,
        "longitude": 139.7234
      },
      {
        "name": "行田市",
        "latitude": 36.1389,
        "longitude": 139.4558
      },
      {
        "name": "秩父市",
        "latitude": 35.9916,
        "longitude": 139.0853
      },
      {
        "name": "所沢市",
        "latitude": 35.7996,
        "longitude": 139.4687
      },
      {
        "name": "飯能市",
        "latitude": 35.8557,
        "longitude": 139.3276
      },
      {
        "name": "加須市",
        "latitude": 36.1314,
        "longitude": 139.6019
      },
      {
        "name": "本庄市",
        "latitude": 36.2437,
        "longitude": 139.1905
      },
      {
        "name": "東松山市",
        "latitude": 36.0422,
        "longitude": 139.4
      },
      {
        "name": "春日部市",
        "latitude": 35.974,
        "longitude": 139.7548
      },
      {
        "name": "狭山市",
        "latitude": 35.8531,
        "longitude": 139.4122
      },
      {
        "name": "羽生市",
        "latitude": 36.1726,
        "longitude": 139.5485
      },
      {
        "name": "鴻巣市",
        "latitude": 36.0658,
        "longitude": 139.5222
      },
      {
        "name": "深谷市",
        "latitude": 36.197,
        "longitude": 139.2817
      },
      {
        "name": "上尾市",
        "latitude": 35.9774,
        "longitude": 139.5932
      },
      {
        "name": "草加市",
        "latitude": 35.8254,
        "longitude": 139.8054
      },
      {
        "name": "越谷市",
        "latitude": 35.8906,
        "longitude": 139.791
      },
      {
        "name": "蕨市",
        "latitude": 35.8256,
        "longitude": 139.6796
      },
      {
        "name": "戸田市",
        "latitude": 35.8176,
        "longitude": 139.678
      },
      {
        "name": "入間市",
        "latitude": 35.8358,
        "longitude": 139.3911
      },
      {
        "name": "朝霞市",
        "latitude": 35.7972,
        "longitude": 139.5937
      },
      {
        "name": "志木市",
        "latitude": 35.8366,
        "longitude": 139.5802
      },
      {
        "name": "和光市",
        "latitude": 35.7814,
        "longitude": 139.6058
      },
      {
        "name": "新座市",
        "latitude": 35.7932,
        "longitude": 139.5656
      },
      {
        "name": "桶川市",
        "latitude": 36.0028,
        "longitude": 139.5584
      },
      {
        "name": "久喜市",
        "latitude": 36.0622,
        "longitude": 139.6669
      },
      {
        "name": "北本市",
        "latitude": 36.0267,
        "longitude": 139.53
      },
      {
        "name": "八潮市",
        "latitude": 35.8223,
        "longitude": 139.8397
      },
      {
        "name": "富士見市",
        "latitude": 35.8567,
        "longitude": 139.5492
      },
      {
        "name": "三郷市",
        "latitude": 35.8302,
        "longitude": 139.8723
      },
      {
        "name": "蓮田市",
        "latitude": 35.9944,
        "longitude": 139.6621
      },
      {
        "name": "坂戸市",
        "latitude": 35.9572,
        "longitude": 139.4031
      },
      {
        "name": "幸手市",
        "latitude": 36.0781,
        "longitude": 139.7258
      },
      {
        "name": "鶴ヶ島市",
        "latitude": 35.9344,
        "longitude": 139.3931
      },
      {
        "name": "日高市",
        "latitude": 35.9078,
        "longitude": 139.3392
      },
      {
        "name": "吉川市",
        "latitude": 35.896,
        "longitude": 139.8557
      },
      {
        "name": "ふじみ野市",
        "latitude": 35.8793,
        "longitude": 139.5195
      },
      {
        "name": "白岡市",
        "latitude": 36.0191,
        "longitude": 139.6769
      },
      {
        "name": "伊奈町",
        "latitude": 36,
        "longitude": 139.6239
      },
      {
        "name": "三芳町",
        "latitude": 35.8283,
        "longitude": 139.5267
      },
      {
        "name": "毛呂山町",
        "latitude": 35.9415,
        "longitude": 139.316
      },
      {
        "name": "越生町",
        "latitude": 35.9644,
        "longitude": 139.2942
      },
      {
        "name": "滑川町",
        "latitude": 36.0661,
        "longitude": 139.3608
      },
      {
        "name": "嵐山町",
        "latitude": 36.0565,
        "longitude": 139.3206
      },
      {
        "name": "小川町",
        "latitude": 36.0567,
        "longitude": 139.2619
      },
      {
        "name": "川島町",
        "latitude": 35.9925,
        "longitude": 139.4842
      },
      {
        "name": "吉見町",
        "latitude": 36.0398,
        "longitude": 139.4538
      },
      {
        "name": "鳩山町",
        "latitude": 35.9815,
        "longitude": 139.3341
      },
      {
        "name": "ときがわ町",
        "latitude": 36.0086,
        "longitude": 139.297
      },
      {
        "name": "横瀬町",
        "latitude": 35.9873,
        "longitude": 139.1001
      },
      {
        "name": "皆野町",
        "latitude": 36.0708,
        "longitude": 139.0988
      },
      {
        "name": "長瀞町",
        "latitude": 36.1147,
        "longitude": 139.1098
      },
      {
        "name": "小鹿野町",
        "latitude": 36.0172,
        "longitude": 139.0087
      },
      {
        "name": "東秩父村",
        "latitude": 36.0581,
        "longitude": 139.1947
      },
      {
        "name": "美里町",
        "latitude": 36.1771,
        "longitude": 139.1815
      },
      {
        "name": "神川町",
        "latitude": 36.2135,
        "longitude": 139.1018
      },
      {
        "name": "上里町",
        "latitude": 36.2517,
        "longitude": 139.1449
      },
      {
        "name": "寄居町",
        "latitude": 36.1183,
        "longitude": 139.1931
      },
      {
        "name": "宮代町",
        "latitude": 36.0227,
        "longitude": 139.7227
      },
      {
        "name": "杉戸町",
        "latitude": 36.0258,
        "longitude": 139.7367
      },
      {
        "name": "松伏町",
        "latitude": 35.9257,
        "longitude": 139.8152
      },
      {
        "name": "さいたま市西区",
        "latitude": 35.9252,
        "longitude": 139.5797
      },
      {
        "name": "さいたま市北区",
        "latitude": 35.9309,
        "longitude": 139.6202
      },
      {
        "name": "さいたま市大宮区",
        "latitude": 35.9019,
        "longitude": 139.6306
      },
      {
        "name": "さいたま市見沼区",
        "latitude": 35.9353,
        "longitude": 139.6544
      },
      {
        "name": "さいたま市中央区",
        "latitude": 35.884,
        "longitude": 139.6262
      },
      {
        "name": "さいたま市桜区",
        "latitude": 35.8562,
        "longitude": 139.6103
      },
      {
        "name": "さいたま市浦和区",
        "latitude": 35.862,
        "longitude": 139.6456
      },
      {
        "name": "さいたま市南区",
        "latitude": 35.8453,
        "longitude": 139.6454
      },
      {
        "name": "さいたま市緑区",
        "latitude": 35.8711,
        "longitude": 139.6841
      },
      {
        "name": "さいたま市岩槻区",
        "latitude": 35.9497,
        "longitude": 139.6942
      }
    ]
  },
  {
    "prefecture": "千葉県",
    "municipalities": [
      {
        "name": "千葉市",
        "latitude": 35.607,
        "longitude": 140.1061
      },
      {
        "name": "銚子市",
        "latitude": 35.7347,
        "longitude": 140.8266
      },
      {
        "name": "市川市",
        "latitude": 35.7219,
        "longitude": 139.9311
      },
      {
        "name": "船橋市",
        "latitude": 35.6947,
        "longitude": 139.9825
      },
      {
        "name": "館山市",
        "latitude": 34.9965,
        "longitude": 139.87
      },
      {
        "name": "木更津市",
        "latitude": 35.3812,
        "longitude": 139.9249
      },
      {
        "name": "松戸市",
        "latitude": 35.7877,
        "longitude": 139.9032
      },
      {
        "name": "野田市",
        "latitude": 35.9551,
        "longitude": 139.8749
      },
      {
        "name": "茂原市",
        "latitude": 35.4285,
        "longitude": 140.2878
      },
      {
        "name": "成田市",
        "latitude": 35.7767,
        "longitude": 140.3183
      },
      {
        "name": "佐倉市",
        "latitude": 35.7235,
        "longitude": 140.224
      },
      {
        "name": "東金市",
        "latitude": 35.56,
        "longitude": 140.3661
      },
      {
        "name": "旭市",
        "latitude": 35.716,
        "longitude": 140.6482
      },
      {
        "name": "習志野市",
        "latitude": 35.6817,
        "longitude": 140.0273
      },
      {
        "name": "柏市",
        "latitude": 35.8675,
        "longitude": 139.9759
      },
      {
        "name": "勝浦市",
        "latitude": 35.1522,
        "longitude": 140.3209
      },
      {
        "name": "市原市",
        "latitude": 35.4981,
        "longitude": 140.1156
      },
      {
        "name": "流山市",
        "latitude": 35.8563,
        "longitude": 139.9027
      },
      {
        "name": "八千代市",
        "latitude": 35.7225,
        "longitude": 140.0997
      },
      {
        "name": "我孫子市",
        "latitude": 35.8642,
        "longitude": 140.0283
      },
      {
        "name": "鴨川市",
        "latitude": 35.1141,
        "longitude": 140.099
      },
      {
        "name": "鎌ケ谷市",
        "latitude": 35.7769,
        "longitude": 140.0008
      },
      {
        "name": "君津市",
        "latitude": 35.3306,
        "longitude": 139.9025
      },
      {
        "name": "富津市",
        "latitude": 35.3042,
        "longitude": 139.8571
      },
      {
        "name": "浦安市",
        "latitude": 35.6532,
        "longitude": 139.902
      },
      {
        "name": "四街道市",
        "latitude": 35.6702,
        "longitude": 140.1682
      },
      {
        "name": "袖ケ浦市",
        "latitude": 35.4299,
        "longitude": 139.9545
      },
      {
        "name": "八街市",
        "latitude": 35.6659,
        "longitude": 140.318
      },
      {
        "name": "印西市",
        "latitude": 35.8323,
        "longitude": 140.1458
      },
      {
        "name": "白井市",
        "latitude": 35.7913,
        "longitude": 140.056
      },
      {
        "name": "富里市",
        "latitude": 35.7268,
        "longitude": 140.3431
      },
      {
        "name": "南房総市",
        "latitude": 35.0432,
        "longitude": 139.84
      },
      {
        "name": "匝瑳市",
        "latitude": 35.7079,
        "longitude": 140.5642
      },
      {
        "name": "香取市",
        "latitude": 35.8977,
        "longitude": 140.4993
      },
      {
        "name": "山武市",
        "latitude": 35.6029,
        "longitude": 140.4135
      },
      {
        "name": "いすみ市",
        "latitude": 35.2539,
        "longitude": 140.3853
      },
      {
        "name": "大網白里市",
        "latitude": 35.5217,
        "longitude": 140.321
      },
      {
        "name": "酒々井町",
        "latitude": 35.7249,
        "longitude": 140.2696
      },
      {
        "name": "栄町",
        "latitude": 35.8408,
        "longitude": 140.2439
      },
      {
        "name": "神崎町",
        "latitude": 35.9015,
        "longitude": 140.4052
      },
      {
        "name": "多古町",
        "latitude": 35.7356,
        "longitude": 140.4678
      },
      {
        "name": "東庄町",
        "latitude": 35.8371,
        "longitude": 140.6687
      },
      {
        "name": "九十九里町",
        "latitude": 35.535,
        "longitude": 140.4404
      },
      {
        "name": "芝山町",
        "latitude": 35.6931,
        "longitude": 140.4143
      },
      {
        "name": "横芝光町",
        "latitude": 35.6656,
        "longitude": 140.5043
      },
      {
        "name": "一宮町",
        "latitude": 35.3726,
        "longitude": 140.3687
      },
      {
        "name": "睦沢町",
        "latitude": 35.361,
        "longitude": 140.3192
      },
      {
        "name": "長生村",
        "latitude": 35.4122,
        "longitude": 140.3542
      },
      {
        "name": "白子町",
        "latitude": 35.4543,
        "longitude": 140.3743
      },
      {
        "name": "長柄町",
        "latitude": 35.4311,
        "longitude": 140.2269
      },
      {
        "name": "長南町",
        "latitude": 35.3861,
        "longitude": 140.2368
      },
      {
        "name": "大多喜町",
        "latitude": 35.2852,
        "longitude": 140.2454
      },
      {
        "name": "御宿町",
        "latitude": 35.1917,
        "longitude": 140.3486
      },
      {
        "name": "鋸南町",
        "latitude": 35.111,
        "longitude": 139.8355
      },
      {
        "name": "千葉市中央区",
        "latitude": 35.6074,
        "longitude": 140.1228
      },
      {
        "name": "千葉市花見川区",
        "latitude": 35.6628,
        "longitude": 140.069
      },
      {
        "name": "千葉市稲毛区",
        "latitude": 35.6362,
        "longitude": 140.1072
      },
      {
        "name": "千葉市若葉区",
        "latitude": 35.634,
        "longitude": 140.1557
      },
      {
        "name": "千葉市緑区",
        "latitude": 35.5605,
        "longitude": 140.1762
      },
      {
        "name": "千葉市美浜区",
        "latitude": 35.6405,
        "longitude": 140.0631
      }
    ]
  },
  {
    "prefecture": "東京都",
    "municipalities": [
      {
        "name": "千代田区",
        "latitude": 35.6939,
        "longitude": 139.7536
      },
      {
        "name": "中央区",
        "latitude": 35.6706,
        "longitude": 139.772
      },
      {
        "name": "港区",
        "latitude": 35.6581,
        "longitude": 139.7517
      },
      {
        "name": "新宿区",
        "latitude": 35.6939,
        "longitude": 139.7036
      },
      {
        "name": "文京区",
        "latitude": 35.7078,
        "longitude": 139.7527
      },
      {
        "name": "台東区",
        "latitude": 35.7126,
        "longitude": 139.7797
      },
      {
        "name": "墨田区",
        "latitude": 35.7107,
        "longitude": 139.8015
      },
      {
        "name": "江東区",
        "latitude": 35.6732,
        "longitude": 139.817
      },
      {
        "name": "品川区",
        "latitude": 35.609,
        "longitude": 139.7302
      },
      {
        "name": "目黒区",
        "latitude": 35.6415,
        "longitude": 139.6982
      },
      {
        "name": "大田区",
        "latitude": 35.5612,
        "longitude": 139.716
      },
      {
        "name": "世田谷区",
        "latitude": 35.646,
        "longitude": 139.6532
      },
      {
        "name": "渋谷区",
        "latitude": 35.6637,
        "longitude": 139.6977
      },
      {
        "name": "中野区",
        "latitude": 35.7089,
        "longitude": 139.6629
      },
      {
        "name": "杉並区",
        "latitude": 35.6995,
        "longitude": 139.6365
      },
      {
        "name": "豊島区",
        "latitude": 35.7261,
        "longitude": 139.7167
      },
      {
        "name": "北区",
        "latitude": 35.7528,
        "longitude": 139.7336
      },
      {
        "name": "荒川区",
        "latitude": 35.7361,
        "longitude": 139.7833
      },
      {
        "name": "板橋区",
        "latitude": 35.7512,
        "longitude": 139.7092
      },
      {
        "name": "練馬区",
        "latitude": 35.7356,
        "longitude": 139.6518
      },
      {
        "name": "足立区",
        "latitude": 35.775,
        "longitude": 139.8047
      },
      {
        "name": "葛飾区",
        "latitude": 35.7433,
        "longitude": 139.8472
      },
      {
        "name": "江戸川区",
        "latitude": 35.7067,
        "longitude": 139.8681
      },
      {
        "name": "八王子市",
        "latitude": 35.6667,
        "longitude": 139.3158
      },
      {
        "name": "立川市",
        "latitude": 35.7139,
        "longitude": 139.4078
      },
      {
        "name": "武蔵野市",
        "latitude": 35.7178,
        "longitude": 139.5661
      },
      {
        "name": "三鷹市",
        "latitude": 35.6833,
        "longitude": 139.5598
      },
      {
        "name": "青梅市",
        "latitude": 35.788,
        "longitude": 139.2758
      },
      {
        "name": "府中市",
        "latitude": 35.6694,
        "longitude": 139.4776
      },
      {
        "name": "昭島市",
        "latitude": 35.7057,
        "longitude": 139.3536
      },
      {
        "name": "調布市",
        "latitude": 35.6506,
        "longitude": 139.5408
      },
      {
        "name": "町田市",
        "latitude": 35.5466,
        "longitude": 139.4386
      },
      {
        "name": "小金井市",
        "latitude": 35.6994,
        "longitude": 139.5031
      },
      {
        "name": "小平市",
        "latitude": 35.7285,
        "longitude": 139.4775
      },
      {
        "name": "日野市",
        "latitude": 35.6714,
        "longitude": 139.395
      },
      {
        "name": "東村山市",
        "latitude": 35.7547,
        "longitude": 139.4686
      },
      {
        "name": "国分寺市",
        "latitude": 35.6967,
        "longitude": 139.4698
      },
      {
        "name": "国立市",
        "latitude": 35.684,
        "longitude": 139.4414
      },
      {
        "name": "福生市",
        "latitude": 35.7385,
        "longitude": 139.327
      },
      {
        "name": "狛江市",
        "latitude": 35.6348,
        "longitude": 139.5787
      },
      {
        "name": "東大和市",
        "latitude": 35.7454,
        "longitude": 139.4269
      },
      {
        "name": "清瀬市",
        "latitude": 35.7853,
        "longitude": 139.5269
      },
      {
        "name": "東久留米市",
        "latitude": 35.758,
        "longitude": 139.5299
      },
      {
        "name": "武蔵村山市",
        "latitude": 35.7549,
        "longitude": 139.3874
      },
      {
        "name": "多摩市",
        "latitude": 35.6369,
        "longitude": 139.4464
      },
      {
        "name": "稲城市",
        "latitude": 35.6379,
        "longitude": 139.5046
      },
      {
        "name": "羽村市",
        "latitude": 35.7672,
        "longitude": 139.3111
      },
      {
        "name": "あきる野市",
        "latitude": 35.7289,
        "longitude": 139.2942
      },
      {
        "name": "西東京市",
        "latitude": 35.7257,
        "longitude": 139.5385
      },
      {
        "name": "瑞穂町",
        "latitude": 35.7719,
        "longitude": 139.3541
      },
      {
        "name": "日の出町",
        "latitude": 35.7421,
        "longitude": 139.2574
      },
      {
        "name": "檜原村",
        "latitude": 35.7268,
        "longitude": 139.1489
      },
      {
        "name": "奥多摩町",
        "latitude": 35.8095,
        "longitude": 139.0962
      },
      {
        "name": "大島町",
        "latitude": 34.7502,
        "longitude": 139.3555
      },
      {
        "name": "利島村",
        "latitude": 34.5291,
        "longitude": 139.282
      },
      {
        "name": "新島村",
        "latitude": 34.3772,
        "longitude": 139.257
      },
      {
        "name": "神津島村",
        "latitude": 34.2055,
        "longitude": 139.1345
      },
      {
        "name": "三宅村",
        "latitude": 34.0758,
        "longitude": 139.4797
      },
      {
        "name": "御蔵島村",
        "latitude": 33.8973,
        "longitude": 139.5959
      },
      {
        "name": "八丈町",
        "latitude": 33.1022,
        "longitude": 139.8005
      },
      {
        "name": "青ヶ島村",
        "latitude": 32.4669,
        "longitude": 139.7633
      },
      {
        "name": "小笠原村",
        "latitude": 27.0943,
        "longitude": 142.1919
      }
    ]
  },
  {
    "prefecture": "神奈川県",
    "municipalities": [
      {
        "name": "横浜市",
        "latitude": 35.4503,
        "longitude": 139.6342
      },
      {
        "name": "川崎市",
        "latitude": 35.5309,
        "longitude": 139.703
      },
      {
        "name": "相模原市",
        "latitude": 35.5714,
        "longitude": 139.3733
      },
      {
        "name": "横須賀市",
        "latitude": 35.2815,
        "longitude": 139.6722
      },
      {
        "name": "平塚市",
        "latitude": 35.3352,
        "longitude": 139.3496
      },
      {
        "name": "鎌倉市",
        "latitude": 35.3192,
        "longitude": 139.5469
      },
      {
        "name": "藤沢市",
        "latitude": 35.3389,
        "longitude": 139.4912
      },
      {
        "name": "小田原市",
        "latitude": 35.2647,
        "longitude": 139.1522
      },
      {
        "name": "茅ヶ崎市",
        "latitude": 35.3339,
        "longitude": 139.4037
      },
      {
        "name": "逗子市",
        "latitude": 35.2956,
        "longitude": 139.5804
      },
      {
        "name": "三浦市",
        "latitude": 35.1442,
        "longitude": 139.6208
      },
      {
        "name": "秦野市",
        "latitude": 35.3747,
        "longitude": 139.22
      },
      {
        "name": "厚木市",
        "latitude": 35.4431,
        "longitude": 139.3625
      },
      {
        "name": "大和市",
        "latitude": 35.4875,
        "longitude": 139.4581
      },
      {
        "name": "伊勢原市",
        "latitude": 35.4029,
        "longitude": 139.315
      },
      {
        "name": "海老名市",
        "latitude": 35.4464,
        "longitude": 139.3908
      },
      {
        "name": "座間市",
        "latitude": 35.4886,
        "longitude": 139.4077
      },
      {
        "name": "南足柄市",
        "latitude": 35.3206,
        "longitude": 139.1
      },
      {
        "name": "綾瀬市",
        "latitude": 35.4372,
        "longitude": 139.4264
      },
      {
        "name": "葉山町",
        "latitude": 35.2721,
        "longitude": 139.5862
      },
      {
        "name": "寒川町",
        "latitude": 35.373,
        "longitude": 139.3839
      },
      {
        "name": "大磯町",
        "latitude": 35.3068,
        "longitude": 139.3114
      },
      {
        "name": "二宮町",
        "latitude": 35.2995,
        "longitude": 139.2556
      },
      {
        "name": "中井町",
        "latitude": 35.3308,
        "longitude": 139.2189
      },
      {
        "name": "大井町",
        "latitude": 35.3267,
        "longitude": 139.1564
      },
      {
        "name": "松田町",
        "latitude": 35.3482,
        "longitude": 139.1394
      },
      {
        "name": "山北町",
        "latitude": 35.3606,
        "longitude": 139.0839
      },
      {
        "name": "開成町",
        "latitude": 35.3361,
        "longitude": 139.1234
      },
      {
        "name": "箱根町",
        "latitude": 35.2324,
        "longitude": 139.1069
      },
      {
        "name": "真鶴町",
        "latitude": 35.1584,
        "longitude": 139.1371
      },
      {
        "name": "湯河原町",
        "latitude": 35.1478,
        "longitude": 139.1083
      },
      {
        "name": "愛川町",
        "latitude": 35.5289,
        "longitude": 139.3217
      },
      {
        "name": "清川村",
        "latitude": 35.4823,
        "longitude": 139.2764
      },
      {
        "name": "横浜市鶴見区",
        "latitude": 35.5085,
        "longitude": 139.6824
      },
      {
        "name": "横浜市神奈川区",
        "latitude": 35.4769,
        "longitude": 139.6294
      },
      {
        "name": "横浜市西区",
        "latitude": 35.4536,
        "longitude": 139.6169
      },
      {
        "name": "横浜市中区",
        "latitude": 35.4447,
        "longitude": 139.6422
      },
      {
        "name": "横浜市南区",
        "latitude": 35.4344,
        "longitude": 139.6275
      },
      {
        "name": "横浜市保土ケ谷区",
        "latitude": 35.4599,
        "longitude": 139.596
      },
      {
        "name": "横浜市磯子区",
        "latitude": 35.4024,
        "longitude": 139.6185
      },
      {
        "name": "横浜市金沢区",
        "latitude": 35.3381,
        "longitude": 139.6245
      },
      {
        "name": "横浜市港北区",
        "latitude": 35.519,
        "longitude": 139.633
      },
      {
        "name": "横浜市戸塚区",
        "latitude": 35.4,
        "longitude": 139.5335
      },
      {
        "name": "横浜市港南区",
        "latitude": 35.4009,
        "longitude": 139.5926
      },
      {
        "name": "横浜市旭区",
        "latitude": 35.4747,
        "longitude": 139.5447
      },
      {
        "name": "横浜市緑区",
        "latitude": 35.5123,
        "longitude": 139.538
      },
      {
        "name": "横浜市瀬谷区",
        "latitude": 35.466,
        "longitude": 139.4988
      },
      {
        "name": "横浜市栄区",
        "latitude": 35.3644,
        "longitude": 139.5541
      },
      {
        "name": "横浜市泉区",
        "latitude": 35.4178,
        "longitude": 139.4888
      },
      {
        "name": "横浜市青葉区",
        "latitude": 35.5528,
        "longitude": 139.537
      },
      {
        "name": "横浜市都筑区",
        "latitude": 35.5448,
        "longitude": 139.5708
      },
      {
        "name": "川崎市川崎区",
        "latitude": 35.5297,
        "longitude": 139.7038
      },
      {
        "name": "川崎市幸区",
        "latitude": 35.5445,
        "longitude": 139.687
      },
      {
        "name": "川崎市中原区",
        "latitude": 35.5763,
        "longitude": 139.6558
      },
      {
        "name": "川崎市高津区",
        "latitude": 35.5994,
        "longitude": 139.6081
      },
      {
        "name": "川崎市多摩区",
        "latitude": 35.6196,
        "longitude": 139.5621
      },
      {
        "name": "川崎市宮前区",
        "latitude": 35.5892,
        "longitude": 139.5786
      },
      {
        "name": "川崎市麻生区",
        "latitude": 35.6038,
        "longitude": 139.5059
      },
      {
        "name": "相模原市緑区",
        "latitude": 35.5956,
        "longitude": 139.3377
      },
      {
        "name": "相模原市中央区",
        "latitude": 35.5714,
        "longitude": 139.3733
      },
      {
        "name": "相模原市南区",
        "latitude": 35.5303,
        "longitude": 139.4305
      }
    ]
  },
  {
    "prefecture": "新潟県",
    "municipalities": [
      {
        "name": "新潟市",
        "latitude": 37.9161,
        "longitude": 139.0365
      },
      {
        "name": "長岡市",
        "latitude": 37.4465,
        "longitude": 138.8515
      },
      {
        "name": "三条市",
        "latitude": 37.6364,
        "longitude": 138.9617
      },
      {
        "name": "柏崎市",
        "latitude": 37.365,
        "longitude": 138.558
      },
      {
        "name": "新発田市",
        "latitude": 37.948,
        "longitude": 139.3271
      },
      {
        "name": "小千谷市",
        "latitude": 37.3144,
        "longitude": 138.795
      },
      {
        "name": "加茂市",
        "latitude": 37.6664,
        "longitude": 139.0403
      },
      {
        "name": "十日町市",
        "latitude": 37.1275,
        "longitude": 138.7556
      },
      {
        "name": "見附市",
        "latitude": 37.5316,
        "longitude": 138.9128
      },
      {
        "name": "村上市",
        "latitude": 38.2242,
        "longitude": 139.48
      },
      {
        "name": "燕市",
        "latitude": 37.6732,
        "longitude": 138.8821
      },
      {
        "name": "糸魚川市",
        "latitude": 37.0391,
        "longitude": 137.8627
      },
      {
        "name": "妙高市",
        "latitude": 37.0253,
        "longitude": 138.2533
      },
      {
        "name": "五泉市",
        "latitude": 37.7445,
        "longitude": 139.1826
      },
      {
        "name": "上越市",
        "latitude": 37.1479,
        "longitude": 138.2361
      },
      {
        "name": "阿賀野市",
        "latitude": 37.8345,
        "longitude": 139.226
      },
      {
        "name": "佐渡市",
        "latitude": 38.0186,
        "longitude": 138.368
      },
      {
        "name": "魚沼市",
        "latitude": 37.2364,
        "longitude": 138.9638
      },
      {
        "name": "南魚沼市",
        "latitude": 37.0656,
        "longitude": 138.8761
      },
      {
        "name": "胎内市",
        "latitude": 38.0597,
        "longitude": 139.4103
      },
      {
        "name": "聖籠町",
        "latitude": 37.9744,
        "longitude": 139.2745
      },
      {
        "name": "弥彦村",
        "latitude": 37.6911,
        "longitude": 138.8552
      },
      {
        "name": "田上町",
        "latitude": 37.6988,
        "longitude": 139.058
      },
      {
        "name": "阿賀町",
        "latitude": 37.6756,
        "longitude": 139.4588
      },
      {
        "name": "出雲崎町",
        "latitude": 37.5307,
        "longitude": 138.7094
      },
      {
        "name": "湯沢町",
        "latitude": 36.934,
        "longitude": 138.8175
      },
      {
        "name": "津南町",
        "latitude": 37.0142,
        "longitude": 138.6525
      },
      {
        "name": "刈羽村",
        "latitude": 37.4219,
        "longitude": 138.6225
      },
      {
        "name": "関川村",
        "latitude": 38.0894,
        "longitude": 139.565
      },
      {
        "name": "粟島浦村",
        "latitude": 38.4683,
        "longitude": 139.2544
      },
      {
        "name": "新潟市北区",
        "latitude": 37.9135,
        "longitude": 139.2216
      },
      {
        "name": "新潟市東区",
        "latitude": 37.9248,
        "longitude": 139.0926
      },
      {
        "name": "新潟市中央区",
        "latitude": 37.9225,
        "longitude": 139.0432
      },
      {
        "name": "新潟市江南区",
        "latitude": 37.8676,
        "longitude": 139.094
      },
      {
        "name": "新潟市秋葉区",
        "latitude": 37.7885,
        "longitude": 139.1146
      },
      {
        "name": "新潟市南区",
        "latitude": 37.7658,
        "longitude": 139.0192
      },
      {
        "name": "新潟市西区",
        "latitude": 37.8742,
        "longitude": 138.972
      },
      {
        "name": "新潟市西蒲区",
        "latitude": 37.7605,
        "longitude": 138.8893
      }
    ]
  },
  {
    "prefecture": "富山県",
    "municipalities": [
      {
        "name": "富山市",
        "latitude": 36.6959,
        "longitude": 137.2137
      },
      {
        "name": "高岡市",
        "latitude": 36.7541,
        "longitude": 137.0257
      },
      {
        "name": "魚津市",
        "latitude": 36.8274,
        "longitude": 137.4091
      },
      {
        "name": "氷見市",
        "latitude": 36.856,
        "longitude": 136.9728
      },
      {
        "name": "滑川市",
        "latitude": 36.7644,
        "longitude": 137.3411
      },
      {
        "name": "黒部市",
        "latitude": 36.8715,
        "longitude": 137.448
      },
      {
        "name": "砺波市",
        "latitude": 36.6475,
        "longitude": 136.9622
      },
      {
        "name": "小矢部市",
        "latitude": 36.6756,
        "longitude": 136.8686
      },
      {
        "name": "南砺市",
        "latitude": 36.5575,
        "longitude": 136.8754
      },
      {
        "name": "射水市",
        "latitude": 36.7305,
        "longitude": 137.0754
      },
      {
        "name": "舟橋村",
        "latitude": 36.7035,
        "longitude": 137.3074
      },
      {
        "name": "上市町",
        "latitude": 36.6983,
        "longitude": 137.3625
      },
      {
        "name": "立山町",
        "latitude": 36.6635,
        "longitude": 137.3137
      },
      {
        "name": "入善町",
        "latitude": 36.9251,
        "longitude": 137.5051
      },
      {
        "name": "朝日町",
        "latitude": 36.9462,
        "longitude": 137.56
      }
    ]
  },
  {
    "prefecture": "石川県",
    "municipalities": [
      {
        "name": "金沢市",
        "latitude": 36.5611,
        "longitude": 136.6565
      },
      {
        "name": "七尾市",
        "latitude": 37.0431,
        "longitude": 136.9672
      },
      {
        "name": "小松市",
        "latitude": 36.4086,
        "longitude": 136.4456
      },
      {
        "name": "輪島市",
        "latitude": 37.3906,
        "longitude": 136.8992
      },
      {
        "name": "珠洲市",
        "latitude": 37.4364,
        "longitude": 137.2605
      },
      {
        "name": "加賀市",
        "latitude": 36.3028,
        "longitude": 136.315
      },
      {
        "name": "羽咋市",
        "latitude": 36.8936,
        "longitude": 136.7789
      },
      {
        "name": "かほく市",
        "latitude": 36.72,
        "longitude": 136.7067
      },
      {
        "name": "白山市",
        "latitude": 36.5144,
        "longitude": 136.5656
      },
      {
        "name": "能美市",
        "latitude": 36.447,
        "longitude": 136.5542
      },
      {
        "name": "野々市市",
        "latitude": 36.5197,
        "longitude": 136.6097
      },
      {
        "name": "川北町",
        "latitude": 36.4684,
        "longitude": 136.5424
      },
      {
        "name": "津幡町",
        "latitude": 36.6688,
        "longitude": 136.7288
      },
      {
        "name": "内灘町",
        "latitude": 36.6536,
        "longitude": 136.6451
      },
      {
        "name": "志賀町",
        "latitude": 37.0064,
        "longitude": 136.7781
      },
      {
        "name": "宝達志水町",
        "latitude": 36.8628,
        "longitude": 136.7976
      },
      {
        "name": "中能登町",
        "latitude": 36.9889,
        "longitude": 136.9017
      },
      {
        "name": "穴水町",
        "latitude": 37.2309,
        "longitude": 136.9124
      },
      {
        "name": "能登町",
        "latitude": 37.3104,
        "longitude": 137.1478
      }
    ]
  },
  {
    "prefecture": "福井県",
    "municipalities": [
      {
        "name": "福井市",
        "latitude": 36.0641,
        "longitude": 136.2196
      },
      {
        "name": "敦賀市",
        "latitude": 35.6456,
        "longitude": 136.0554
      },
      {
        "name": "小浜市",
        "latitude": 35.4956,
        "longitude": 135.7467
      },
      {
        "name": "大野市",
        "latitude": 35.9798,
        "longitude": 136.4875
      },
      {
        "name": "勝山市",
        "latitude": 36.0608,
        "longitude": 136.5006
      },
      {
        "name": "鯖江市",
        "latitude": 35.9567,
        "longitude": 136.1844
      },
      {
        "name": "あわら市",
        "latitude": 36.2114,
        "longitude": 136.2289
      },
      {
        "name": "越前市",
        "latitude": 35.9039,
        "longitude": 136.169
      },
      {
        "name": "坂井市",
        "latitude": 36.1669,
        "longitude": 136.2317
      },
      {
        "name": "永平寺町",
        "latitude": 36.0922,
        "longitude": 136.2986
      },
      {
        "name": "池田町",
        "latitude": 35.8903,
        "longitude": 136.3442
      },
      {
        "name": "南越前町",
        "latitude": 35.835,
        "longitude": 136.1944
      },
      {
        "name": "越前町",
        "latitude": 35.9742,
        "longitude": 136.1292
      },
      {
        "name": "美浜町",
        "latitude": 35.6006,
        "longitude": 135.9406
      },
      {
        "name": "高浜町",
        "latitude": 35.4879,
        "longitude": 135.5463
      },
      {
        "name": "おおい町",
        "latitude": 35.4811,
        "longitude": 135.6178
      },
      {
        "name": "若狭町",
        "latitude": 35.549,
        "longitude": 135.9082
      }
    ]
  },
  {
    "prefecture": "山梨県",
    "municipalities": [
      {
        "name": "甲府市",
        "latitude": 35.6622,
        "longitude": 138.5683
      },
      {
        "name": "富士吉田市",
        "latitude": 35.4875,
        "longitude": 138.8079
      },
      {
        "name": "都留市",
        "latitude": 35.5516,
        "longitude": 138.9055
      },
      {
        "name": "山梨市",
        "latitude": 35.6933,
        "longitude": 138.6872
      },
      {
        "name": "大月市",
        "latitude": 35.6106,
        "longitude": 138.94
      },
      {
        "name": "韮崎市",
        "latitude": 35.7089,
        "longitude": 138.4464
      },
      {
        "name": "南アルプス市",
        "latitude": 35.6083,
        "longitude": 138.465
      },
      {
        "name": "北杜市",
        "latitude": 35.7765,
        "longitude": 138.4236
      },
      {
        "name": "甲斐市",
        "latitude": 35.6608,
        "longitude": 138.5158
      },
      {
        "name": "笛吹市",
        "latitude": 35.6473,
        "longitude": 138.6398
      },
      {
        "name": "上野原市",
        "latitude": 35.6303,
        "longitude": 139.1086
      },
      {
        "name": "甲州市",
        "latitude": 35.7042,
        "longitude": 138.7294
      },
      {
        "name": "中央市",
        "latitude": 35.5999,
        "longitude": 138.5168
      },
      {
        "name": "市川三郷町",
        "latitude": 35.5652,
        "longitude": 138.5024
      },
      {
        "name": "早川町",
        "latitude": 35.4128,
        "longitude": 138.363
      },
      {
        "name": "身延町",
        "latitude": 35.4675,
        "longitude": 138.4425
      },
      {
        "name": "南部町",
        "latitude": 35.2424,
        "longitude": 138.4861
      },
      {
        "name": "富士川町",
        "latitude": 35.561,
        "longitude": 138.462
      },
      {
        "name": "昭和町",
        "latitude": 35.628,
        "longitude": 138.5351
      },
      {
        "name": "道志村",
        "latitude": 35.528,
        "longitude": 139.0334
      },
      {
        "name": "西桂町",
        "latitude": 35.5243,
        "longitude": 138.8474
      },
      {
        "name": "忍野村",
        "latitude": 35.4601,
        "longitude": 138.8479
      },
      {
        "name": "山中湖村",
        "latitude": 35.4106,
        "longitude": 138.8611
      },
      {
        "name": "鳴沢村",
        "latitude": 35.4814,
        "longitude": 138.7067
      },
      {
        "name": "富士河口湖町",
        "latitude": 35.4972,
        "longitude": 138.755
      },
      {
        "name": "小菅村",
        "latitude": 35.7603,
        "longitude": 138.9403
      },
      {
        "name": "丹波山村",
        "latitude": 35.7917,
        "longitude": 138.9178
      }
    ]
  },
  {
    "prefecture": "長野県",
    "municipalities": [
      {
        "name": "長野市",
        "latitude": 36.6485,
        "longitude": 138.1948
      },
      {
        "name": "松本市",
        "latitude": 36.2381,
        "longitude": 137.972
      },
      {
        "name": "上田市",
        "latitude": 36.402,
        "longitude": 138.2487
      },
      {
        "name": "岡谷市",
        "latitude": 36.0669,
        "longitude": 138.0495
      },
      {
        "name": "飯田市",
        "latitude": 35.515,
        "longitude": 137.8215
      },
      {
        "name": "諏訪市",
        "latitude": 36.0392,
        "longitude": 138.1142
      },
      {
        "name": "須坂市",
        "latitude": 36.6511,
        "longitude": 138.3073
      },
      {
        "name": "小諸市",
        "latitude": 36.3275,
        "longitude": 138.4259
      },
      {
        "name": "伊那市",
        "latitude": 35.8275,
        "longitude": 137.9539
      },
      {
        "name": "駒ヶ根市",
        "latitude": 35.7288,
        "longitude": 137.934
      },
      {
        "name": "中野市",
        "latitude": 36.7415,
        "longitude": 138.3692
      },
      {
        "name": "大町市",
        "latitude": 36.503,
        "longitude": 137.8509
      },
      {
        "name": "飯山市",
        "latitude": 36.8517,
        "longitude": 138.3656
      },
      {
        "name": "茅野市",
        "latitude": 35.9956,
        "longitude": 138.1589
      },
      {
        "name": "塩尻市",
        "latitude": 36.115,
        "longitude": 137.9536
      },
      {
        "name": "佐久市",
        "latitude": 36.2489,
        "longitude": 138.4769
      },
      {
        "name": "千曲市",
        "latitude": 36.5308,
        "longitude": 138.1149
      },
      {
        "name": "東御市",
        "latitude": 36.3594,
        "longitude": 138.3306
      },
      {
        "name": "安曇野市",
        "latitude": 36.3039,
        "longitude": 137.9058
      },
      {
        "name": "小海町",
        "latitude": 36.0951,
        "longitude": 138.4835
      },
      {
        "name": "川上村",
        "latitude": 35.9751,
        "longitude": 138.5785
      },
      {
        "name": "南牧村",
        "latitude": 36.0209,
        "longitude": 138.4922
      },
      {
        "name": "南相木村",
        "latitude": 36.036,
        "longitude": 138.5471
      },
      {
        "name": "北相木村",
        "latitude": 36.0592,
        "longitude": 138.5512
      },
      {
        "name": "佐久穂町",
        "latitude": 36.1603,
        "longitude": 138.4835
      },
      {
        "name": "軽井沢町",
        "latitude": 36.3483,
        "longitude": 138.597
      },
      {
        "name": "御代田町",
        "latitude": 36.3228,
        "longitude": 138.5065
      },
      {
        "name": "立科町",
        "latitude": 36.2721,
        "longitude": 138.3161
      },
      {
        "name": "青木村",
        "latitude": 36.37,
        "longitude": 138.1286
      },
      {
        "name": "長和町",
        "latitude": 36.2699,
        "longitude": 138.258
      },
      {
        "name": "下諏訪町",
        "latitude": 36.0695,
        "longitude": 138.0802
      },
      {
        "name": "富士見町",
        "latitude": 35.9147,
        "longitude": 138.2408
      },
      {
        "name": "原村",
        "latitude": 35.9644,
        "longitude": 138.2175
      },
      {
        "name": "辰野町",
        "latitude": 35.9825,
        "longitude": 137.9875
      },
      {
        "name": "箕輪町",
        "latitude": 35.915,
        "longitude": 137.9819
      },
      {
        "name": "飯島町",
        "latitude": 35.6768,
        "longitude": 137.9194
      },
      {
        "name": "南箕輪村",
        "latitude": 35.8729,
        "longitude": 137.9751
      },
      {
        "name": "中川村",
        "latitude": 35.6345,
        "longitude": 137.946
      },
      {
        "name": "宮田村",
        "latitude": 35.7689,
        "longitude": 137.9444
      },
      {
        "name": "松川町",
        "latitude": 35.5972,
        "longitude": 137.9097
      },
      {
        "name": "高森町",
        "latitude": 35.5515,
        "longitude": 137.8785
      },
      {
        "name": "阿南町",
        "latitude": 35.3236,
        "longitude": 137.8161
      },
      {
        "name": "阿智村",
        "latitude": 35.4439,
        "longitude": 137.7475
      },
      {
        "name": "平谷村",
        "latitude": 35.3233,
        "longitude": 137.6303
      },
      {
        "name": "根羽村",
        "latitude": 35.2555,
        "longitude": 137.5819
      },
      {
        "name": "下條村",
        "latitude": 35.3974,
        "longitude": 137.7859
      },
      {
        "name": "売木村",
        "latitude": 35.2711,
        "longitude": 137.7111
      },
      {
        "name": "天龍村",
        "latitude": 35.2764,
        "longitude": 137.8543
      },
      {
        "name": "泰阜村",
        "latitude": 35.3774,
        "longitude": 137.8459
      },
      {
        "name": "喬木村",
        "latitude": 35.5139,
        "longitude": 137.8739
      },
      {
        "name": "豊丘村",
        "latitude": 35.5514,
        "longitude": 137.8958
      },
      {
        "name": "大鹿村",
        "latitude": 35.5782,
        "longitude": 138.0341
      },
      {
        "name": "上松町",
        "latitude": 35.7822,
        "longitude": 137.6932
      },
      {
        "name": "南木曽町",
        "latitude": 35.6036,
        "longitude": 137.6089
      },
      {
        "name": "木祖村",
        "latitude": 35.9363,
        "longitude": 137.7832
      },
      {
        "name": "王滝村",
        "latitude": 35.8094,
        "longitude": 137.5509
      },
      {
        "name": "大桑村",
        "latitude": 35.6893,
        "longitude": 137.6716
      },
      {
        "name": "木曽町",
        "latitude": 35.8418,
        "longitude": 137.6912
      },
      {
        "name": "麻績村",
        "latitude": 36.4561,
        "longitude": 138.0453
      },
      {
        "name": "生坂村",
        "latitude": 36.4252,
        "longitude": 137.9276
      },
      {
        "name": "山形村",
        "latitude": 36.1681,
        "longitude": 137.8789
      },
      {
        "name": "朝日村",
        "latitude": 36.1293,
        "longitude": 137.8671
      },
      {
        "name": "筑北村",
        "latitude": 36.4027,
        "longitude": 138.0117
      },
      {
        "name": "池田町",
        "latitude": 36.4213,
        "longitude": 137.8747
      },
      {
        "name": "松川村",
        "latitude": 36.4242,
        "longitude": 137.8544
      },
      {
        "name": "白馬村",
        "latitude": 36.6983,
        "longitude": 137.8622
      },
      {
        "name": "小谷村",
        "latitude": 36.7791,
        "longitude": 137.9083
      },
      {
        "name": "坂城町",
        "latitude": 36.4618,
        "longitude": 138.1802
      },
      {
        "name": "小布施町",
        "latitude": 36.6974,
        "longitude": 138.3122
      },
      {
        "name": "高山村",
        "latitude": 36.6798,
        "longitude": 138.3633
      },
      {
        "name": "山ノ内町",
        "latitude": 36.7446,
        "longitude": 138.4127
      },
      {
        "name": "木島平村",
        "latitude": 36.8579,
        "longitude": 138.407
      },
      {
        "name": "野沢温泉村",
        "latitude": 36.9228,
        "longitude": 138.4406
      },
      {
        "name": "信濃町",
        "latitude": 36.8063,
        "longitude": 138.207
      },
      {
        "name": "小川村",
        "latitude": 36.6172,
        "longitude": 137.9747
      },
      {
        "name": "飯綱町",
        "latitude": 36.7545,
        "longitude": 138.2354
      },
      {
        "name": "栄村",
        "latitude": 36.9875,
        "longitude": 138.5766
      }
    ]
  },
  {
    "prefecture": "岐阜県",
    "municipalities": [
      {
        "name": "岐阜市",
        "latitude": 35.4262,
        "longitude": 136.7599
      },
      {
        "name": "大垣市",
        "latitude": 35.3599,
        "longitude": 136.6128
      },
      {
        "name": "高山市",
        "latitude": 36.146,
        "longitude": 137.2522
      },
      {
        "name": "多治見市",
        "latitude": 35.3328,
        "longitude": 137.1322
      },
      {
        "name": "関市",
        "latitude": 35.4958,
        "longitude": 136.9178
      },
      {
        "name": "中津川市",
        "latitude": 35.4875,
        "longitude": 137.5005
      },
      {
        "name": "美濃市",
        "latitude": 35.5447,
        "longitude": 136.9075
      },
      {
        "name": "瑞浪市",
        "latitude": 35.3617,
        "longitude": 137.2546
      },
      {
        "name": "羽島市",
        "latitude": 35.3195,
        "longitude": 136.7027
      },
      {
        "name": "恵那市",
        "latitude": 35.4493,
        "longitude": 137.4128
      },
      {
        "name": "美濃加茂市",
        "latitude": 35.4403,
        "longitude": 137.0155
      },
      {
        "name": "土岐市",
        "latitude": 35.3523,
        "longitude": 137.183
      },
      {
        "name": "各務原市",
        "latitude": 35.3986,
        "longitude": 136.8485
      },
      {
        "name": "可児市",
        "latitude": 35.4261,
        "longitude": 137.061
      },
      {
        "name": "山県市",
        "latitude": 35.5061,
        "longitude": 136.7814
      },
      {
        "name": "瑞穂市",
        "latitude": 35.3919,
        "longitude": 136.6908
      },
      {
        "name": "飛騨市",
        "latitude": 36.2383,
        "longitude": 137.1861
      },
      {
        "name": "本巣市",
        "latitude": 35.4554,
        "longitude": 136.6659
      },
      {
        "name": "郡上市",
        "latitude": 35.7486,
        "longitude": 136.9644
      },
      {
        "name": "下呂市",
        "latitude": 35.8058,
        "longitude": 137.2442
      },
      {
        "name": "海津市",
        "latitude": 35.2205,
        "longitude": 136.6371
      },
      {
        "name": "岐南町",
        "latitude": 35.3898,
        "longitude": 136.7834
      },
      {
        "name": "笠松町",
        "latitude": 35.3672,
        "longitude": 136.7633
      },
      {
        "name": "養老町",
        "latitude": 35.3084,
        "longitude": 136.5614
      },
      {
        "name": "垂井町",
        "latitude": 35.3662,
        "longitude": 136.538
      },
      {
        "name": "関ケ原町",
        "latitude": 35.3655,
        "longitude": 136.467
      },
      {
        "name": "神戸町",
        "latitude": 35.4173,
        "longitude": 136.6085
      },
      {
        "name": "輪之内町",
        "latitude": 35.2851,
        "longitude": 136.6375
      },
      {
        "name": "安八町",
        "latitude": 35.3354,
        "longitude": 136.6654
      },
      {
        "name": "揖斐川町",
        "latitude": 35.4873,
        "longitude": 136.5687
      },
      {
        "name": "大野町",
        "latitude": 35.4706,
        "longitude": 136.6275
      },
      {
        "name": "池田町",
        "latitude": 35.4422,
        "longitude": 136.5731
      },
      {
        "name": "北方町",
        "latitude": 35.4357,
        "longitude": 136.6844
      },
      {
        "name": "坂祝町",
        "latitude": 35.4267,
        "longitude": 136.9853
      },
      {
        "name": "富加町",
        "latitude": 35.4847,
        "longitude": 136.9797
      },
      {
        "name": "川辺町",
        "latitude": 35.4866,
        "longitude": 137.0706
      },
      {
        "name": "七宗町",
        "latitude": 35.5439,
        "longitude": 137.12
      },
      {
        "name": "八百津町",
        "latitude": 35.476,
        "longitude": 137.1416
      },
      {
        "name": "白川町",
        "latitude": 35.5819,
        "longitude": 137.1879
      },
      {
        "name": "東白川村",
        "latitude": 35.6425,
        "longitude": 137.3239
      },
      {
        "name": "御嵩町",
        "latitude": 35.4344,
        "longitude": 137.1308
      },
      {
        "name": "白川村",
        "latitude": 36.2709,
        "longitude": 136.8986
      }
    ]
  },
  {
    "prefecture": "静岡県",
    "municipalities": [
      {
        "name": "静岡市",
        "latitude": 34.9752,
        "longitude": 138.3833
      },
      {
        "name": "浜松市",
        "latitude": 34.7108,
        "longitude": 137.7263
      },
      {
        "name": "沼津市",
        "latitude": 35.0956,
        "longitude": 138.8636
      },
      {
        "name": "熱海市",
        "latitude": 35.0964,
        "longitude": 139.0717
      },
      {
        "name": "三島市",
        "latitude": 35.1185,
        "longitude": 138.9186
      },
      {
        "name": "富士宮市",
        "latitude": 35.222,
        "longitude": 138.6216
      },
      {
        "name": "伊東市",
        "latitude": 34.9658,
        "longitude": 139.1019
      },
      {
        "name": "島田市",
        "latitude": 34.8361,
        "longitude": 138.1769
      },
      {
        "name": "富士市",
        "latitude": 35.1614,
        "longitude": 138.6762
      },
      {
        "name": "磐田市",
        "latitude": 34.7179,
        "longitude": 137.8515
      },
      {
        "name": "焼津市",
        "latitude": 34.8672,
        "longitude": 138.3228
      },
      {
        "name": "掛川市",
        "latitude": 34.7688,
        "longitude": 137.9984
      },
      {
        "name": "藤枝市",
        "latitude": 34.8675,
        "longitude": 138.2578
      },
      {
        "name": "御殿場市",
        "latitude": 35.3087,
        "longitude": 138.9346
      },
      {
        "name": "袋井市",
        "latitude": 34.7503,
        "longitude": 137.925
      },
      {
        "name": "下田市",
        "latitude": 34.6987,
        "longitude": 138.9387
      },
      {
        "name": "裾野市",
        "latitude": 35.1739,
        "longitude": 138.9067
      },
      {
        "name": "湖西市",
        "latitude": 34.7185,
        "longitude": 137.5316
      },
      {
        "name": "伊豆市",
        "latitude": 34.9766,
        "longitude": 138.9467
      },
      {
        "name": "御前崎市",
        "latitude": 34.6381,
        "longitude": 138.1281
      },
      {
        "name": "菊川市",
        "latitude": 34.7577,
        "longitude": 138.0846
      },
      {
        "name": "伊豆の国市",
        "latitude": 35.0277,
        "longitude": 138.9289
      },
      {
        "name": "牧之原市",
        "latitude": 34.74,
        "longitude": 138.2247
      },
      {
        "name": "東伊豆町",
        "latitude": 34.7728,
        "longitude": 139.0413
      },
      {
        "name": "河津町",
        "latitude": 34.7572,
        "longitude": 138.9875
      },
      {
        "name": "南伊豆町",
        "latitude": 34.6512,
        "longitude": 138.8585
      },
      {
        "name": "松崎町",
        "latitude": 34.7529,
        "longitude": 138.7788
      },
      {
        "name": "西伊豆町",
        "latitude": 34.7717,
        "longitude": 138.7753
      },
      {
        "name": "函南町",
        "latitude": 35.0889,
        "longitude": 138.9533
      },
      {
        "name": "清水町",
        "latitude": 35.099,
        "longitude": 138.9028
      },
      {
        "name": "長泉町",
        "latitude": 35.1377,
        "longitude": 138.8972
      },
      {
        "name": "小山町",
        "latitude": 35.36,
        "longitude": 138.9875
      },
      {
        "name": "吉田町",
        "latitude": 34.7708,
        "longitude": 138.2519
      },
      {
        "name": "川根本町",
        "latitude": 35.0469,
        "longitude": 138.0817
      },
      {
        "name": "森町",
        "latitude": 34.8356,
        "longitude": 137.9271
      },
      {
        "name": "静岡市葵区",
        "latitude": 34.9752,
        "longitude": 138.3833
      },
      {
        "name": "静岡市駿河区",
        "latitude": 34.9607,
        "longitude": 138.4041
      },
      {
        "name": "静岡市清水区",
        "latitude": 35.0158,
        "longitude": 138.4897
      },
      {
        "name": "浜松市中央区",
        "latitude": 34.7108,
        "longitude": 137.7263
      },
      {
        "name": "浜松市浜名区",
        "latitude": 34.7915,
        "longitude": 137.7832
      },
      {
        "name": "浜松市天竜区",
        "latitude": 34.8726,
        "longitude": 137.8162
      }
    ]
  },
  {
    "prefecture": "愛知県",
    "municipalities": [
      {
        "name": "名古屋市",
        "latitude": 35.1814,
        "longitude": 136.9066
      },
      {
        "name": "豊橋市",
        "latitude": 34.7692,
        "longitude": 137.3914
      },
      {
        "name": "岡崎市",
        "latitude": 34.9548,
        "longitude": 137.1731
      },
      {
        "name": "一宮市",
        "latitude": 35.3038,
        "longitude": 136.803
      },
      {
        "name": "瀬戸市",
        "latitude": 35.2237,
        "longitude": 137.084
      },
      {
        "name": "半田市",
        "latitude": 34.8918,
        "longitude": 136.938
      },
      {
        "name": "春日井市",
        "latitude": 35.2475,
        "longitude": 136.9722
      },
      {
        "name": "豊川市",
        "latitude": 34.8269,
        "longitude": 137.3758
      },
      {
        "name": "津島市",
        "latitude": 35.1771,
        "longitude": 136.7414
      },
      {
        "name": "碧南市",
        "latitude": 34.8847,
        "longitude": 136.9936
      },
      {
        "name": "刈谷市",
        "latitude": 34.9894,
        "longitude": 137.0023
      },
      {
        "name": "豊田市",
        "latitude": 35.0826,
        "longitude": 137.1562
      },
      {
        "name": "安城市",
        "latitude": 34.9586,
        "longitude": 137.0803
      },
      {
        "name": "西尾市",
        "latitude": 34.8619,
        "longitude": 137.062
      },
      {
        "name": "蒲郡市",
        "latitude": 34.8264,
        "longitude": 137.2197
      },
      {
        "name": "犬山市",
        "latitude": 35.3784,
        "longitude": 136.9444
      },
      {
        "name": "常滑市",
        "latitude": 34.8961,
        "longitude": 136.8545
      },
      {
        "name": "江南市",
        "latitude": 35.3321,
        "longitude": 136.8708
      },
      {
        "name": "小牧市",
        "latitude": 35.2904,
        "longitude": 136.911
      },
      {
        "name": "稲沢市",
        "latitude": 35.2481,
        "longitude": 136.7803
      },
      {
        "name": "新城市",
        "latitude": 34.8989,
        "longitude": 137.4978
      },
      {
        "name": "東海市",
        "latitude": 35.023,
        "longitude": 136.9023
      },
      {
        "name": "大府市",
        "latitude": 35.0117,
        "longitude": 136.9639
      },
      {
        "name": "知多市",
        "latitude": 34.9965,
        "longitude": 136.8648
      },
      {
        "name": "知立市",
        "latitude": 35.0013,
        "longitude": 137.0508
      },
      {
        "name": "尾張旭市",
        "latitude": 35.2166,
        "longitude": 137.0354
      },
      {
        "name": "高浜市",
        "latitude": 34.9276,
        "longitude": 136.9873
      },
      {
        "name": "岩倉市",
        "latitude": 35.2794,
        "longitude": 136.8714
      },
      {
        "name": "豊明市",
        "latitude": 35.0537,
        "longitude": 137.0129
      },
      {
        "name": "日進市",
        "latitude": 35.132,
        "longitude": 137.0394
      },
      {
        "name": "田原市",
        "latitude": 34.669,
        "longitude": 137.2636
      },
      {
        "name": "愛西市",
        "latitude": 35.1531,
        "longitude": 136.7281
      },
      {
        "name": "清須市",
        "latitude": 35.1998,
        "longitude": 136.8529
      },
      {
        "name": "北名古屋市",
        "latitude": 35.2457,
        "longitude": 136.8659
      },
      {
        "name": "弥富市",
        "latitude": 35.1101,
        "longitude": 136.7248
      },
      {
        "name": "みよし市",
        "latitude": 35.0894,
        "longitude": 137.0749
      },
      {
        "name": "あま市",
        "latitude": 35.1882,
        "longitude": 136.8037
      },
      {
        "name": "長久手市",
        "latitude": 35.1842,
        "longitude": 137.0486
      },
      {
        "name": "東郷町",
        "latitude": 35.0969,
        "longitude": 137.0526
      },
      {
        "name": "豊山町",
        "latitude": 35.2505,
        "longitude": 136.9121
      },
      {
        "name": "大口町",
        "latitude": 35.3325,
        "longitude": 136.9078
      },
      {
        "name": "扶桑町",
        "latitude": 35.3592,
        "longitude": 136.9131
      },
      {
        "name": "大治町",
        "latitude": 35.1751,
        "longitude": 136.8201
      },
      {
        "name": "蟹江町",
        "latitude": 35.1322,
        "longitude": 136.7869
      },
      {
        "name": "飛島村",
        "latitude": 35.0788,
        "longitude": 136.7912
      },
      {
        "name": "阿久比町",
        "latitude": 34.9329,
        "longitude": 136.9152
      },
      {
        "name": "東浦町",
        "latitude": 34.9771,
        "longitude": 136.9656
      },
      {
        "name": "南知多町",
        "latitude": 34.7152,
        "longitude": 136.9299
      },
      {
        "name": "美浜町",
        "latitude": 34.7788,
        "longitude": 136.9082
      },
      {
        "name": "武豊町",
        "latitude": 34.8511,
        "longitude": 136.9148
      },
      {
        "name": "幸田町",
        "latitude": 34.8644,
        "longitude": 137.1656
      },
      {
        "name": "設楽町",
        "latitude": 35.0971,
        "longitude": 137.5714
      },
      {
        "name": "東栄町",
        "latitude": 35.0769,
        "longitude": 137.6979
      },
      {
        "name": "豊根村",
        "latitude": 35.1465,
        "longitude": 137.7199
      },
      {
        "name": "名古屋市千種区",
        "latitude": 35.1627,
        "longitude": 136.9776
      },
      {
        "name": "名古屋市東区",
        "latitude": 35.1793,
        "longitude": 136.9261
      },
      {
        "name": "名古屋市北区",
        "latitude": 35.1942,
        "longitude": 136.9117
      },
      {
        "name": "名古屋市西区",
        "latitude": 35.1892,
        "longitude": 136.89
      },
      {
        "name": "名古屋市中村区",
        "latitude": 35.1767,
        "longitude": 136.8686
      },
      {
        "name": "名古屋市中区",
        "latitude": 35.1686,
        "longitude": 136.9103
      },
      {
        "name": "名古屋市昭和区",
        "latitude": 35.1503,
        "longitude": 136.9342
      },
      {
        "name": "名古屋市瑞穂区",
        "latitude": 35.1314,
        "longitude": 136.935
      },
      {
        "name": "名古屋市熱田区",
        "latitude": 35.1283,
        "longitude": 136.9106
      },
      {
        "name": "名古屋市中川区",
        "latitude": 35.1417,
        "longitude": 136.855
      },
      {
        "name": "名古屋市港区",
        "latitude": 35.1078,
        "longitude": 136.8856
      },
      {
        "name": "名古屋市南区",
        "latitude": 35.095,
        "longitude": 136.9311
      },
      {
        "name": "名古屋市守山区",
        "latitude": 35.2033,
        "longitude": 136.9767
      },
      {
        "name": "名古屋市緑区",
        "latitude": 35.0708,
        "longitude": 136.9522
      },
      {
        "name": "名古屋市名東区",
        "latitude": 35.1758,
        "longitude": 137.0103
      },
      {
        "name": "名古屋市天白区",
        "latitude": 35.1228,
        "longitude": 136.975
      }
    ]
  },
  {
    "prefecture": "三重県",
    "municipalities": [
      {
        "name": "津市",
        "latitude": 34.7186,
        "longitude": 136.5057
      },
      {
        "name": "四日市市",
        "latitude": 34.9651,
        "longitude": 136.6245
      },
      {
        "name": "伊勢市",
        "latitude": 34.4875,
        "longitude": 136.7093
      },
      {
        "name": "松阪市",
        "latitude": 34.578,
        "longitude": 136.5276
      },
      {
        "name": "桑名市",
        "latitude": 35.0622,
        "longitude": 136.6839
      },
      {
        "name": "鈴鹿市",
        "latitude": 34.8819,
        "longitude": 136.5842
      },
      {
        "name": "名張市",
        "latitude": 34.6276,
        "longitude": 136.1084
      },
      {
        "name": "尾鷲市",
        "latitude": 34.0708,
        "longitude": 136.191
      },
      {
        "name": "亀山市",
        "latitude": 34.8558,
        "longitude": 136.4517
      },
      {
        "name": "鳥羽市",
        "latitude": 34.4813,
        "longitude": 136.8434
      },
      {
        "name": "熊野市",
        "latitude": 33.8886,
        "longitude": 136.1003
      },
      {
        "name": "いなべ市",
        "latitude": 35.1584,
        "longitude": 136.5167
      },
      {
        "name": "志摩市",
        "latitude": 34.3282,
        "longitude": 136.8297
      },
      {
        "name": "伊賀市",
        "latitude": 34.7498,
        "longitude": 136.1423
      },
      {
        "name": "木曽岬町",
        "latitude": 35.0756,
        "longitude": 136.7315
      },
      {
        "name": "東員町",
        "latitude": 35.0742,
        "longitude": 136.5837
      },
      {
        "name": "菰野町",
        "latitude": 35.02,
        "longitude": 136.5075
      },
      {
        "name": "朝日町",
        "latitude": 35.0342,
        "longitude": 136.6644
      },
      {
        "name": "川越町",
        "latitude": 35.0228,
        "longitude": 136.6741
      },
      {
        "name": "多気町",
        "latitude": 34.4961,
        "longitude": 136.5461
      },
      {
        "name": "明和町",
        "latitude": 34.5476,
        "longitude": 136.6234
      },
      {
        "name": "大台町",
        "latitude": 34.3934,
        "longitude": 136.408
      },
      {
        "name": "玉城町",
        "latitude": 34.4903,
        "longitude": 136.6308
      },
      {
        "name": "度会町",
        "latitude": 34.4389,
        "longitude": 136.6225
      },
      {
        "name": "大紀町",
        "latitude": 34.3581,
        "longitude": 136.4158
      },
      {
        "name": "南伊勢町",
        "latitude": 34.3521,
        "longitude": 136.7037
      },
      {
        "name": "紀北町",
        "latitude": 34.2115,
        "longitude": 136.3373
      },
      {
        "name": "御浜町",
        "latitude": 33.8144,
        "longitude": 136.0488
      },
      {
        "name": "紀宝町",
        "latitude": 33.7338,
        "longitude": 136.0097
      }
    ]
  },
  {
    "prefecture": "滋賀県",
    "municipalities": [
      {
        "name": "大津市",
        "latitude": 35.0178,
        "longitude": 135.8547
      },
      {
        "name": "彦根市",
        "latitude": 35.2744,
        "longitude": 136.2597
      },
      {
        "name": "長浜市",
        "latitude": 35.3808,
        "longitude": 136.2784
      },
      {
        "name": "近江八幡市",
        "latitude": 35.1283,
        "longitude": 136.098
      },
      {
        "name": "草津市",
        "latitude": 35.0132,
        "longitude": 135.96
      },
      {
        "name": "守山市",
        "latitude": 35.0583,
        "longitude": 135.994
      },
      {
        "name": "栗東市",
        "latitude": 35.0217,
        "longitude": 135.9981
      },
      {
        "name": "甲賀市",
        "latitude": 34.9661,
        "longitude": 136.1663
      },
      {
        "name": "野洲市",
        "latitude": 35.0675,
        "longitude": 136.0258
      },
      {
        "name": "湖南市",
        "latitude": 35.0038,
        "longitude": 136.0846
      },
      {
        "name": "高島市",
        "latitude": 35.3531,
        "longitude": 136.0358
      },
      {
        "name": "東近江市",
        "latitude": 35.1126,
        "longitude": 136.2076
      },
      {
        "name": "米原市",
        "latitude": 35.315,
        "longitude": 136.2914
      },
      {
        "name": "日野町",
        "latitude": 35.0181,
        "longitude": 136.2461
      },
      {
        "name": "竜王町",
        "latitude": 35.0608,
        "longitude": 136.1245
      },
      {
        "name": "愛荘町",
        "latitude": 35.1688,
        "longitude": 136.2123
      },
      {
        "name": "豊郷町",
        "latitude": 35.2003,
        "longitude": 136.2303
      },
      {
        "name": "甲良町",
        "latitude": 35.2042,
        "longitude": 136.2614
      },
      {
        "name": "多賀町",
        "latitude": 35.2221,
        "longitude": 136.2922
      }
    ]
  },
  {
    "prefecture": "京都府",
    "municipalities": [
      {
        "name": "京都市",
        "latitude": 35.0117,
        "longitude": 135.7681
      },
      {
        "name": "福知山市",
        "latitude": 35.2967,
        "longitude": 135.1264
      },
      {
        "name": "舞鶴市",
        "latitude": 35.4747,
        "longitude": 135.3861
      },
      {
        "name": "綾部市",
        "latitude": 35.2989,
        "longitude": 135.2586
      },
      {
        "name": "宇治市",
        "latitude": 34.8844,
        "longitude": 135.7997
      },
      {
        "name": "宮津市",
        "latitude": 35.5356,
        "longitude": 135.1956
      },
      {
        "name": "亀岡市",
        "latitude": 35.0134,
        "longitude": 135.5736
      },
      {
        "name": "城陽市",
        "latitude": 34.8531,
        "longitude": 135.78
      },
      {
        "name": "向日市",
        "latitude": 34.9484,
        "longitude": 135.6984
      },
      {
        "name": "長岡京市",
        "latitude": 34.9265,
        "longitude": 135.6953
      },
      {
        "name": "八幡市",
        "latitude": 34.8754,
        "longitude": 135.7071
      },
      {
        "name": "京田辺市",
        "latitude": 34.8144,
        "longitude": 135.7677
      },
      {
        "name": "京丹後市",
        "latitude": 35.6242,
        "longitude": 135.0611
      },
      {
        "name": "南丹市",
        "latitude": 35.1073,
        "longitude": 135.4707
      },
      {
        "name": "木津川市",
        "latitude": 34.7372,
        "longitude": 135.82
      },
      {
        "name": "大山崎町",
        "latitude": 34.9028,
        "longitude": 135.6886
      },
      {
        "name": "久御山町",
        "latitude": 34.8814,
        "longitude": 135.7328
      },
      {
        "name": "井手町",
        "latitude": 34.8007,
        "longitude": 135.8146
      },
      {
        "name": "宇治田原町",
        "latitude": 34.8448,
        "longitude": 135.8681
      },
      {
        "name": "笠置町",
        "latitude": 34.7605,
        "longitude": 135.9394
      },
      {
        "name": "和束町",
        "latitude": 34.7957,
        "longitude": 135.905
      },
      {
        "name": "精華町",
        "latitude": 34.7608,
        "longitude": 135.7858
      },
      {
        "name": "南山城村",
        "latitude": 34.7727,
        "longitude": 135.9938
      },
      {
        "name": "京丹波町",
        "latitude": 35.17,
        "longitude": 135.4193
      },
      {
        "name": "伊根町",
        "latitude": 35.6753,
        "longitude": 135.2728
      },
      {
        "name": "与謝野町",
        "latitude": 35.5653,
        "longitude": 135.1529
      },
      {
        "name": "京都市北区",
        "latitude": 35.041,
        "longitude": 135.7542
      },
      {
        "name": "京都市上京区",
        "latitude": 35.0296,
        "longitude": 135.7567
      },
      {
        "name": "京都市左京区",
        "latitude": 35.0486,
        "longitude": 135.7785
      },
      {
        "name": "京都市中京区",
        "latitude": 35.01,
        "longitude": 135.7514
      },
      {
        "name": "京都市東山区",
        "latitude": 34.9971,
        "longitude": 135.7764
      },
      {
        "name": "京都市下京区",
        "latitude": 34.9876,
        "longitude": 135.7555
      },
      {
        "name": "京都市南区",
        "latitude": 34.9767,
        "longitude": 135.7464
      },
      {
        "name": "京都市右京区",
        "latitude": 35.0101,
        "longitude": 135.7162
      },
      {
        "name": "京都市伏見区",
        "latitude": 34.9361,
        "longitude": 135.7614
      },
      {
        "name": "京都市山科区",
        "latitude": 34.9724,
        "longitude": 135.8137
      },
      {
        "name": "京都市西京区",
        "latitude": 34.9851,
        "longitude": 135.6933
      }
    ]
  },
  {
    "prefecture": "大阪府",
    "municipalities": [
      {
        "name": "大阪市",
        "latitude": 34.6939,
        "longitude": 135.5022
      },
      {
        "name": "堺市",
        "latitude": 34.5733,
        "longitude": 135.4831
      },
      {
        "name": "岸和田市",
        "latitude": 34.4606,
        "longitude": 135.3709
      },
      {
        "name": "豊中市",
        "latitude": 34.7813,
        "longitude": 135.4698
      },
      {
        "name": "池田市",
        "latitude": 34.8217,
        "longitude": 135.4286
      },
      {
        "name": "吹田市",
        "latitude": 34.7595,
        "longitude": 135.5169
      },
      {
        "name": "泉大津市",
        "latitude": 34.5044,
        "longitude": 135.4103
      },
      {
        "name": "高槻市",
        "latitude": 34.846,
        "longitude": 135.6173
      },
      {
        "name": "貝塚市",
        "latitude": 34.4374,
        "longitude": 135.3581
      },
      {
        "name": "守口市",
        "latitude": 34.7358,
        "longitude": 135.5617
      },
      {
        "name": "枚方市",
        "latitude": 34.8144,
        "longitude": 135.6508
      },
      {
        "name": "茨木市",
        "latitude": 34.8164,
        "longitude": 135.5686
      },
      {
        "name": "八尾市",
        "latitude": 34.6269,
        "longitude": 135.6008
      },
      {
        "name": "泉佐野市",
        "latitude": 34.4068,
        "longitude": 135.3274
      },
      {
        "name": "富田林市",
        "latitude": 34.4995,
        "longitude": 135.5972
      },
      {
        "name": "寝屋川市",
        "latitude": 34.7661,
        "longitude": 135.6281
      },
      {
        "name": "河内長野市",
        "latitude": 34.4579,
        "longitude": 135.5642
      },
      {
        "name": "松原市",
        "latitude": 34.5781,
        "longitude": 135.5519
      },
      {
        "name": "大東市",
        "latitude": 34.7119,
        "longitude": 135.6233
      },
      {
        "name": "和泉市",
        "latitude": 34.4832,
        "longitude": 135.4232
      },
      {
        "name": "箕面市",
        "latitude": 34.8269,
        "longitude": 135.4706
      },
      {
        "name": "柏原市",
        "latitude": 34.5783,
        "longitude": 135.6292
      },
      {
        "name": "羽曳野市",
        "latitude": 34.558,
        "longitude": 135.6063
      },
      {
        "name": "門真市",
        "latitude": 34.7395,
        "longitude": 135.5869
      },
      {
        "name": "摂津市",
        "latitude": 34.7772,
        "longitude": 135.5622
      },
      {
        "name": "高石市",
        "latitude": 34.5206,
        "longitude": 135.4422
      },
      {
        "name": "藤井寺市",
        "latitude": 34.5743,
        "longitude": 135.5975
      },
      {
        "name": "東大阪市",
        "latitude": 34.6794,
        "longitude": 135.6008
      },
      {
        "name": "泉南市",
        "latitude": 34.3658,
        "longitude": 135.2736
      },
      {
        "name": "四條畷市",
        "latitude": 34.74,
        "longitude": 135.6395
      },
      {
        "name": "交野市",
        "latitude": 34.788,
        "longitude": 135.68
      },
      {
        "name": "大阪狭山市",
        "latitude": 34.5037,
        "longitude": 135.5557
      },
      {
        "name": "阪南市",
        "latitude": 34.3596,
        "longitude": 135.2397
      },
      {
        "name": "島本町",
        "latitude": 34.8839,
        "longitude": 135.6628
      },
      {
        "name": "豊能町",
        "latitude": 34.919,
        "longitude": 135.4941
      },
      {
        "name": "能勢町",
        "latitude": 34.9734,
        "longitude": 135.4139
      },
      {
        "name": "忠岡町",
        "latitude": 34.4872,
        "longitude": 135.4014
      },
      {
        "name": "熊取町",
        "latitude": 34.4015,
        "longitude": 135.356
      },
      {
        "name": "田尻町",
        "latitude": 34.3938,
        "longitude": 135.2912
      },
      {
        "name": "岬町",
        "latitude": 34.3169,
        "longitude": 135.1422
      },
      {
        "name": "太子町",
        "latitude": 34.5187,
        "longitude": 135.6476
      },
      {
        "name": "河南町",
        "latitude": 34.4917,
        "longitude": 135.6297
      },
      {
        "name": "千早赤阪村",
        "latitude": 34.4646,
        "longitude": 135.6226
      },
      {
        "name": "大阪市都島区",
        "latitude": 34.7014,
        "longitude": 135.5281
      },
      {
        "name": "大阪市福島区",
        "latitude": 34.6922,
        "longitude": 135.4722
      },
      {
        "name": "大阪市此花区",
        "latitude": 34.6831,
        "longitude": 135.4522
      },
      {
        "name": "大阪市西区",
        "latitude": 34.6764,
        "longitude": 135.4861
      },
      {
        "name": "大阪市港区",
        "latitude": 34.6639,
        "longitude": 135.4608
      },
      {
        "name": "大阪市大正区",
        "latitude": 34.6503,
        "longitude": 135.4728
      },
      {
        "name": "大阪市天王寺区",
        "latitude": 34.6578,
        "longitude": 135.5193
      },
      {
        "name": "大阪市浪速区",
        "latitude": 34.6594,
        "longitude": 135.4997
      },
      {
        "name": "大阪市西淀川区",
        "latitude": 34.7114,
        "longitude": 135.4561
      },
      {
        "name": "大阪市東淀川区",
        "latitude": 34.7412,
        "longitude": 135.5294
      },
      {
        "name": "大阪市東成区",
        "latitude": 34.67,
        "longitude": 135.5411
      },
      {
        "name": "大阪市生野区",
        "latitude": 34.6536,
        "longitude": 135.5344
      },
      {
        "name": "大阪市旭区",
        "latitude": 34.7212,
        "longitude": 135.5443
      },
      {
        "name": "大阪市城東区",
        "latitude": 34.7032,
        "longitude": 135.545
      },
      {
        "name": "大阪市阿倍野区",
        "latitude": 34.6387,
        "longitude": 135.5185
      },
      {
        "name": "大阪市住吉区",
        "latitude": 34.6036,
        "longitude": 135.5005
      },
      {
        "name": "大阪市東住吉区",
        "latitude": 34.6221,
        "longitude": 135.5267
      },
      {
        "name": "大阪市西成区",
        "latitude": 34.635,
        "longitude": 135.4944
      },
      {
        "name": "大阪市淀川区",
        "latitude": 34.7211,
        "longitude": 135.4867
      },
      {
        "name": "大阪市鶴見区",
        "latitude": 34.7044,
        "longitude": 135.5742
      },
      {
        "name": "大阪市住之江区",
        "latitude": 34.6096,
        "longitude": 135.4828
      },
      {
        "name": "大阪市平野区",
        "latitude": 34.6211,
        "longitude": 135.5461
      },
      {
        "name": "大阪市北区",
        "latitude": 34.7056,
        "longitude": 135.51
      },
      {
        "name": "大阪市中央区",
        "latitude": 34.6811,
        "longitude": 135.5097
      },
      {
        "name": "堺市堺区",
        "latitude": 34.5733,
        "longitude": 135.4831
      },
      {
        "name": "堺市中区",
        "latitude": 34.5284,
        "longitude": 135.4987
      },
      {
        "name": "堺市東区",
        "latitude": 34.5382,
        "longitude": 135.5365
      },
      {
        "name": "堺市西区",
        "latitude": 34.535,
        "longitude": 135.4639
      },
      {
        "name": "堺市南区",
        "latitude": 34.4864,
        "longitude": 135.4904
      },
      {
        "name": "堺市北区",
        "latitude": 34.5656,
        "longitude": 135.5172
      },
      {
        "name": "堺市美原区",
        "latitude": 34.5385,
        "longitude": 135.5599
      }
    ]
  },
  {
    "prefecture": "兵庫県",
    "municipalities": [
      {
        "name": "神戸市",
        "latitude": 34.6894,
        "longitude": 135.1958
      },
      {
        "name": "姫路市",
        "latitude": 34.8153,
        "longitude": 134.6856
      },
      {
        "name": "尼崎市",
        "latitude": 34.7333,
        "longitude": 135.4064
      },
      {
        "name": "明石市",
        "latitude": 34.6431,
        "longitude": 134.9976
      },
      {
        "name": "西宮市",
        "latitude": 34.7377,
        "longitude": 135.3418
      },
      {
        "name": "洲本市",
        "latitude": 34.3429,
        "longitude": 134.8954
      },
      {
        "name": "芦屋市",
        "latitude": 34.727,
        "longitude": 135.3041
      },
      {
        "name": "伊丹市",
        "latitude": 34.7845,
        "longitude": 135.4004
      },
      {
        "name": "相生市",
        "latitude": 34.8036,
        "longitude": 134.4681
      },
      {
        "name": "豊岡市",
        "latitude": 35.5446,
        "longitude": 134.8202
      },
      {
        "name": "加古川市",
        "latitude": 34.7569,
        "longitude": 134.8413
      },
      {
        "name": "赤穂市",
        "latitude": 34.755,
        "longitude": 134.3903
      },
      {
        "name": "西脇市",
        "latitude": 34.9834,
        "longitude": 134.9798
      },
      {
        "name": "宝塚市",
        "latitude": 34.8,
        "longitude": 135.3603
      },
      {
        "name": "三木市",
        "latitude": 34.7969,
        "longitude": 134.9902
      },
      {
        "name": "高砂市",
        "latitude": 34.7664,
        "longitude": 134.7906
      },
      {
        "name": "川西市",
        "latitude": 34.83,
        "longitude": 135.4172
      },
      {
        "name": "小野市",
        "latitude": 34.8579,
        "longitude": 134.9399
      },
      {
        "name": "三田市",
        "latitude": 34.89,
        "longitude": 135.2255
      },
      {
        "name": "加西市",
        "latitude": 34.9279,
        "longitude": 134.8418
      },
      {
        "name": "丹波篠山市",
        "latitude": 35.0756,
        "longitude": 135.2194
      },
      {
        "name": "養父市",
        "latitude": 35.4046,
        "longitude": 134.7676
      },
      {
        "name": "丹波市",
        "latitude": 35.1771,
        "longitude": 135.0358
      },
      {
        "name": "南あわじ市",
        "latitude": 34.2944,
        "longitude": 134.7799
      },
      {
        "name": "朝来市",
        "latitude": 35.3399,
        "longitude": 134.8527
      },
      {
        "name": "淡路市",
        "latitude": 34.4397,
        "longitude": 134.915
      },
      {
        "name": "宍粟市",
        "latitude": 35.0044,
        "longitude": 134.5494
      },
      {
        "name": "加東市",
        "latitude": 34.9187,
        "longitude": 134.9734
      },
      {
        "name": "たつの市",
        "latitude": 34.8579,
        "longitude": 134.5453
      },
      {
        "name": "猪名川町",
        "latitude": 34.895,
        "longitude": 135.3761
      },
      {
        "name": "多可町",
        "latitude": 35.0502,
        "longitude": 134.9234
      },
      {
        "name": "稲美町",
        "latitude": 34.7484,
        "longitude": 134.9129
      },
      {
        "name": "播磨町",
        "latitude": 34.7153,
        "longitude": 134.8681
      },
      {
        "name": "市川町",
        "latitude": 34.9893,
        "longitude": 134.7632
      },
      {
        "name": "福崎町",
        "latitude": 34.9503,
        "longitude": 134.7602
      },
      {
        "name": "神河町",
        "latitude": 35.0642,
        "longitude": 134.7398
      },
      {
        "name": "太子町",
        "latitude": 34.8332,
        "longitude": 134.5723
      },
      {
        "name": "上郡町",
        "latitude": 34.8736,
        "longitude": 134.3561
      },
      {
        "name": "佐用町",
        "latitude": 35.0043,
        "longitude": 134.3559
      },
      {
        "name": "香美町",
        "latitude": 35.6322,
        "longitude": 134.6292
      },
      {
        "name": "新温泉町",
        "latitude": 35.6234,
        "longitude": 134.4491
      },
      {
        "name": "神戸市東灘区",
        "latitude": 34.7202,
        "longitude": 135.2657
      },
      {
        "name": "神戸市灘区",
        "latitude": 34.7124,
        "longitude": 135.2395
      },
      {
        "name": "神戸市兵庫区",
        "latitude": 34.6802,
        "longitude": 135.1658
      },
      {
        "name": "神戸市長田区",
        "latitude": 34.6657,
        "longitude": 135.1509
      },
      {
        "name": "神戸市須磨区",
        "latitude": 34.6586,
        "longitude": 135.1337
      },
      {
        "name": "神戸市垂水区",
        "latitude": 34.6306,
        "longitude": 135.0569
      },
      {
        "name": "神戸市北区",
        "latitude": 34.7242,
        "longitude": 135.1462
      },
      {
        "name": "神戸市中央区",
        "latitude": 34.6897,
        "longitude": 135.1949
      },
      {
        "name": "神戸市西区",
        "latitude": 34.7209,
        "longitude": 135.0193
      }
    ]
  },
  {
    "prefecture": "奈良県",
    "municipalities": [
      {
        "name": "奈良市",
        "latitude": 34.685,
        "longitude": 135.8047
      },
      {
        "name": "大和高田市",
        "latitude": 34.5158,
        "longitude": 135.7374
      },
      {
        "name": "大和郡山市",
        "latitude": 34.6496,
        "longitude": 135.7827
      },
      {
        "name": "天理市",
        "latitude": 34.5967,
        "longitude": 135.8372
      },
      {
        "name": "橿原市",
        "latitude": 34.5095,
        "longitude": 135.7926
      },
      {
        "name": "桜井市",
        "latitude": 34.5188,
        "longitude": 135.8427
      },
      {
        "name": "五條市",
        "latitude": 34.3564,
        "longitude": 135.6956
      },
      {
        "name": "御所市",
        "latitude": 34.4633,
        "longitude": 135.7403
      },
      {
        "name": "生駒市",
        "latitude": 34.6919,
        "longitude": 135.7006
      },
      {
        "name": "香芝市",
        "latitude": 34.5413,
        "longitude": 135.699
      },
      {
        "name": "葛城市",
        "latitude": 34.4892,
        "longitude": 135.7267
      },
      {
        "name": "宇陀市",
        "latitude": 34.528,
        "longitude": 135.9523
      },
      {
        "name": "山添村",
        "latitude": 34.6809,
        "longitude": 136.0435
      },
      {
        "name": "平群町",
        "latitude": 34.6292,
        "longitude": 135.7006
      },
      {
        "name": "三郷町",
        "latitude": 34.6002,
        "longitude": 135.6955
      },
      {
        "name": "斑鳩町",
        "latitude": 34.6089,
        "longitude": 135.7306
      },
      {
        "name": "安堵町",
        "latitude": 34.6065,
        "longitude": 135.7568
      },
      {
        "name": "川西町",
        "latitude": 34.5844,
        "longitude": 135.7742
      },
      {
        "name": "三宅町",
        "latitude": 34.5736,
        "longitude": 135.7731
      },
      {
        "name": "田原本町",
        "latitude": 34.5567,
        "longitude": 135.795
      },
      {
        "name": "曽爾村",
        "latitude": 34.5107,
        "longitude": 136.1247
      },
      {
        "name": "御杖村",
        "latitude": 34.488,
        "longitude": 136.1659
      },
      {
        "name": "高取町",
        "latitude": 34.4494,
        "longitude": 135.7931
      },
      {
        "name": "明日香村",
        "latitude": 34.4705,
        "longitude": 135.8125
      },
      {
        "name": "上牧町",
        "latitude": 34.5628,
        "longitude": 135.7167
      },
      {
        "name": "王寺町",
        "latitude": 34.5947,
        "longitude": 135.7066
      },
      {
        "name": "広陵町",
        "latitude": 34.5428,
        "longitude": 135.7508
      },
      {
        "name": "河合町",
        "latitude": 34.5783,
        "longitude": 135.7367
      },
      {
        "name": "吉野町",
        "latitude": 34.396,
        "longitude": 135.8576
      },
      {
        "name": "大淀町",
        "latitude": 34.3906,
        "longitude": 135.79
      },
      {
        "name": "下市町",
        "latitude": 34.3609,
        "longitude": 135.7918
      },
      {
        "name": "黒滝村",
        "latitude": 34.3092,
        "longitude": 135.8522
      },
      {
        "name": "天川村",
        "latitude": 34.2419,
        "longitude": 135.8553
      },
      {
        "name": "野迫川村",
        "latitude": 34.1662,
        "longitude": 135.6331
      },
      {
        "name": "十津川村",
        "latitude": 33.9886,
        "longitude": 135.7925
      },
      {
        "name": "下北山村",
        "latitude": 34.005,
        "longitude": 135.9553
      },
      {
        "name": "上北山村",
        "latitude": 34.1343,
        "longitude": 136.0001
      },
      {
        "name": "川上村",
        "latitude": 34.3383,
        "longitude": 135.9544
      },
      {
        "name": "東吉野村",
        "latitude": 34.4035,
        "longitude": 135.9683
      }
    ]
  },
  {
    "prefecture": "和歌山県",
    "municipalities": [
      {
        "name": "和歌山市",
        "latitude": 34.2306,
        "longitude": 135.1708
      },
      {
        "name": "海南市",
        "latitude": 34.1575,
        "longitude": 135.2397
      },
      {
        "name": "橋本市",
        "latitude": 34.3147,
        "longitude": 135.6053
      },
      {
        "name": "有田市",
        "latitude": 34.0831,
        "longitude": 135.1278
      },
      {
        "name": "御坊市",
        "latitude": 33.8911,
        "longitude": 135.1523
      },
      {
        "name": "田辺市",
        "latitude": 33.7291,
        "longitude": 135.3889
      },
      {
        "name": "新宮市",
        "latitude": 33.7241,
        "longitude": 135.9925
      },
      {
        "name": "紀の川市",
        "latitude": 34.2698,
        "longitude": 135.3627
      },
      {
        "name": "岩出市",
        "latitude": 34.2562,
        "longitude": 135.3114
      },
      {
        "name": "紀美野町",
        "latitude": 34.1671,
        "longitude": 135.308
      },
      {
        "name": "かつらぎ町",
        "latitude": 34.2964,
        "longitude": 135.5039
      },
      {
        "name": "九度山町",
        "latitude": 34.2872,
        "longitude": 135.5622
      },
      {
        "name": "高野町",
        "latitude": 34.2161,
        "longitude": 135.5865
      },
      {
        "name": "湯浅町",
        "latitude": 34.0294,
        "longitude": 135.1904
      },
      {
        "name": "広川町",
        "latitude": 34.03,
        "longitude": 135.1731
      },
      {
        "name": "有田川町",
        "latitude": 34.0575,
        "longitude": 135.2161
      },
      {
        "name": "美浜町",
        "latitude": 33.8938,
        "longitude": 135.1333
      },
      {
        "name": "日高町",
        "latitude": 33.9257,
        "longitude": 135.1411
      },
      {
        "name": "由良町",
        "latitude": 33.9593,
        "longitude": 135.1182
      },
      {
        "name": "印南町",
        "latitude": 33.8196,
        "longitude": 135.2227
      },
      {
        "name": "みなべ町",
        "latitude": 33.7724,
        "longitude": 135.3216
      },
      {
        "name": "日高川町",
        "latitude": 33.9117,
        "longitude": 135.1861
      },
      {
        "name": "白浜町",
        "latitude": 33.6782,
        "longitude": 135.3481
      },
      {
        "name": "上富田町",
        "latitude": 33.6964,
        "longitude": 135.4288
      },
      {
        "name": "すさみ町",
        "latitude": 33.5501,
        "longitude": 135.4967
      },
      {
        "name": "那智勝浦町",
        "latitude": 33.626,
        "longitude": 135.941
      },
      {
        "name": "太地町",
        "latitude": 33.594,
        "longitude": 135.9439
      },
      {
        "name": "古座川町",
        "latitude": 33.5319,
        "longitude": 135.8149
      },
      {
        "name": "北山村",
        "latitude": 33.9321,
        "longitude": 135.9692
      },
      {
        "name": "串本町",
        "latitude": 33.4857,
        "longitude": 135.787
      }
    ]
  },
  {
    "prefecture": "鳥取県",
    "municipalities": [
      {
        "name": "鳥取市",
        "latitude": 35.4945,
        "longitude": 134.2222
      },
      {
        "name": "米子市",
        "latitude": 35.4282,
        "longitude": 133.3309
      },
      {
        "name": "倉吉市",
        "latitude": 35.4301,
        "longitude": 133.8256
      },
      {
        "name": "境港市",
        "latitude": 35.5396,
        "longitude": 133.2316
      },
      {
        "name": "岩美町",
        "latitude": 35.576,
        "longitude": 134.3321
      },
      {
        "name": "若桜町",
        "latitude": 35.3402,
        "longitude": 134.401
      },
      {
        "name": "智頭町",
        "latitude": 35.265,
        "longitude": 134.2267
      },
      {
        "name": "八頭町",
        "latitude": 35.4092,
        "longitude": 134.2505
      },
      {
        "name": "三朝町",
        "latitude": 35.4085,
        "longitude": 133.8623
      },
      {
        "name": "湯梨浜町",
        "latitude": 35.4899,
        "longitude": 133.8647
      },
      {
        "name": "琴浦町",
        "latitude": 35.4951,
        "longitude": 133.6934
      },
      {
        "name": "北栄町",
        "latitude": 35.49,
        "longitude": 133.7584
      },
      {
        "name": "日吉津村",
        "latitude": 35.4402,
        "longitude": 133.3808
      },
      {
        "name": "大山町",
        "latitude": 35.5108,
        "longitude": 133.4961
      },
      {
        "name": "南部町",
        "latitude": 35.3403,
        "longitude": 133.3267
      },
      {
        "name": "伯耆町",
        "latitude": 35.3853,
        "longitude": 133.4075
      },
      {
        "name": "日南町",
        "latitude": 35.1633,
        "longitude": 133.3062
      },
      {
        "name": "日野町",
        "latitude": 35.2408,
        "longitude": 133.4428
      },
      {
        "name": "江府町",
        "latitude": 35.2759,
        "longitude": 133.4791
      }
    ]
  },
  {
    "prefecture": "島根県",
    "municipalities": [
      {
        "name": "松江市",
        "latitude": 35.4678,
        "longitude": 133.0485
      },
      {
        "name": "浜田市",
        "latitude": 34.8992,
        "longitude": 132.08
      },
      {
        "name": "出雲市",
        "latitude": 35.367,
        "longitude": 132.7547
      },
      {
        "name": "益田市",
        "latitude": 34.6749,
        "longitude": 131.8429
      },
      {
        "name": "大田市",
        "latitude": 35.1922,
        "longitude": 132.4997
      },
      {
        "name": "安来市",
        "latitude": 35.4309,
        "longitude": 133.2511
      },
      {
        "name": "江津市",
        "latitude": 35.0116,
        "longitude": 132.2178
      },
      {
        "name": "雲南市",
        "latitude": 35.3077,
        "longitude": 132.9004
      },
      {
        "name": "奥出雲町",
        "latitude": 35.1975,
        "longitude": 133.0025
      },
      {
        "name": "飯南町",
        "latitude": 34.9986,
        "longitude": 132.7133
      },
      {
        "name": "川本町",
        "latitude": 34.9952,
        "longitude": 132.4959
      },
      {
        "name": "美郷町",
        "latitude": 35.0766,
        "longitude": 132.5906
      },
      {
        "name": "邑南町",
        "latitude": 34.8939,
        "longitude": 132.4378
      },
      {
        "name": "津和野町",
        "latitude": 34.542,
        "longitude": 131.8351
      },
      {
        "name": "吉賀町",
        "latitude": 34.3536,
        "longitude": 131.935
      },
      {
        "name": "海士町",
        "latitude": 36.0967,
        "longitude": 133.0965
      },
      {
        "name": "西ノ島町",
        "latitude": 36.0918,
        "longitude": 133.0135
      },
      {
        "name": "知夫村",
        "latitude": 36.0139,
        "longitude": 133.0395
      },
      {
        "name": "隠岐の島町",
        "latitude": 36.2134,
        "longitude": 133.3118
      }
    ]
  },
  {
    "prefecture": "岡山県",
    "municipalities": [
      {
        "name": "岡山市",
        "latitude": 34.6552,
        "longitude": 133.9198
      },
      {
        "name": "倉敷市",
        "latitude": 34.585,
        "longitude": 133.7719
      },
      {
        "name": "津山市",
        "latitude": 35.0691,
        "longitude": 134.0045
      },
      {
        "name": "玉野市",
        "latitude": 34.4919,
        "longitude": 133.9458
      },
      {
        "name": "笠岡市",
        "latitude": 34.5071,
        "longitude": 133.5074
      },
      {
        "name": "井原市",
        "latitude": 34.5978,
        "longitude": 133.4639
      },
      {
        "name": "総社市",
        "latitude": 34.6726,
        "longitude": 133.7467
      },
      {
        "name": "高梁市",
        "latitude": 34.791,
        "longitude": 133.6168
      },
      {
        "name": "新見市",
        "latitude": 34.977,
        "longitude": 133.4704
      },
      {
        "name": "備前市",
        "latitude": 34.7452,
        "longitude": 134.1888
      },
      {
        "name": "瀬戸内市",
        "latitude": 34.665,
        "longitude": 134.0928
      },
      {
        "name": "赤磐市",
        "latitude": 34.7554,
        "longitude": 134.0188
      },
      {
        "name": "真庭市",
        "latitude": 35.0756,
        "longitude": 133.7527
      },
      {
        "name": "美作市",
        "latitude": 35.0264,
        "longitude": 134.1598
      },
      {
        "name": "浅口市",
        "latitude": 34.5278,
        "longitude": 133.585
      },
      {
        "name": "和気町",
        "latitude": 34.8028,
        "longitude": 134.1575
      },
      {
        "name": "早島町",
        "latitude": 34.6008,
        "longitude": 133.8283
      },
      {
        "name": "里庄町",
        "latitude": 34.5138,
        "longitude": 133.557
      },
      {
        "name": "矢掛町",
        "latitude": 34.6276,
        "longitude": 133.5871
      },
      {
        "name": "新庄村",
        "latitude": 35.1797,
        "longitude": 133.5677
      },
      {
        "name": "鏡野町",
        "latitude": 35.0918,
        "longitude": 133.9329
      },
      {
        "name": "勝央町",
        "latitude": 35.0419,
        "longitude": 134.1161
      },
      {
        "name": "奈義町",
        "latitude": 35.1231,
        "longitude": 134.1775
      },
      {
        "name": "西粟倉村",
        "latitude": 35.1718,
        "longitude": 134.3357
      },
      {
        "name": "久米南町",
        "latitude": 34.929,
        "longitude": 133.9605
      },
      {
        "name": "美咲町",
        "latitude": 34.997,
        "longitude": 133.9546
      },
      {
        "name": "吉備中央町",
        "latitude": 34.8635,
        "longitude": 133.6934
      },
      {
        "name": "岡山市北区",
        "latitude": 34.6552,
        "longitude": 133.9198
      },
      {
        "name": "岡山市中区",
        "latitude": 34.6705,
        "longitude": 133.943
      },
      {
        "name": "岡山市東区",
        "latitude": 34.6514,
        "longitude": 134.0295
      },
      {
        "name": "岡山市南区",
        "latitude": 34.5997,
        "longitude": 133.9196
      }
    ]
  },
  {
    "prefecture": "広島県",
    "municipalities": [
      {
        "name": "広島市",
        "latitude": 34.3853,
        "longitude": 132.4553
      },
      {
        "name": "呉市",
        "latitude": 34.2487,
        "longitude": 132.5654
      },
      {
        "name": "竹原市",
        "latitude": 34.3412,
        "longitude": 132.9054
      },
      {
        "name": "三原市",
        "latitude": 34.3977,
        "longitude": 133.0781
      },
      {
        "name": "尾道市",
        "latitude": 34.4092,
        "longitude": 133.2056
      },
      {
        "name": "福山市",
        "latitude": 34.4858,
        "longitude": 133.3625
      },
      {
        "name": "府中市",
        "latitude": 34.5683,
        "longitude": 133.2364
      },
      {
        "name": "三次市",
        "latitude": 34.8055,
        "longitude": 132.8517
      },
      {
        "name": "庄原市",
        "latitude": 34.8577,
        "longitude": 133.0172
      },
      {
        "name": "大竹市",
        "latitude": 34.2379,
        "longitude": 132.2223
      },
      {
        "name": "東広島市",
        "latitude": 34.4264,
        "longitude": 132.7433
      },
      {
        "name": "廿日市市",
        "latitude": 34.3486,
        "longitude": 132.3315
      },
      {
        "name": "安芸高田市",
        "latitude": 34.6664,
        "longitude": 132.7039
      },
      {
        "name": "江田島市",
        "latitude": 34.175,
        "longitude": 132.4622
      },
      {
        "name": "府中町",
        "latitude": 34.3926,
        "longitude": 132.5046
      },
      {
        "name": "海田町",
        "latitude": 34.3664,
        "longitude": 132.5363
      },
      {
        "name": "熊野町",
        "latitude": 34.3359,
        "longitude": 132.5846
      },
      {
        "name": "坂町",
        "latitude": 34.3414,
        "longitude": 132.5139
      },
      {
        "name": "安芸太田町",
        "latitude": 34.5768,
        "longitude": 132.2271
      },
      {
        "name": "北広島町",
        "latitude": 34.6746,
        "longitude": 132.5384
      },
      {
        "name": "大崎上島町",
        "latitude": 34.2697,
        "longitude": 132.9153
      },
      {
        "name": "世羅町",
        "latitude": 34.5869,
        "longitude": 133.0567
      },
      {
        "name": "神石高原町",
        "latitude": 34.7037,
        "longitude": 133.2515
      },
      {
        "name": "広島市中区",
        "latitude": 34.3863,
        "longitude": 132.455
      },
      {
        "name": "広島市東区",
        "latitude": 34.3953,
        "longitude": 132.4825
      },
      {
        "name": "広島市南区",
        "latitude": 34.3799,
        "longitude": 132.469
      },
      {
        "name": "広島市西区",
        "latitude": 34.3939,
        "longitude": 132.4344
      },
      {
        "name": "広島市安佐南区",
        "latitude": 34.4519,
        "longitude": 132.4717
      },
      {
        "name": "広島市安佐北区",
        "latitude": 34.5183,
        "longitude": 132.5078
      },
      {
        "name": "広島市安芸区",
        "latitude": 34.3717,
        "longitude": 132.5256
      },
      {
        "name": "広島市佐伯区",
        "latitude": 34.3644,
        "longitude": 132.3608
      }
    ]
  },
  {
    "prefecture": "山口県",
    "municipalities": [
      {
        "name": "下関市",
        "latitude": 33.9573,
        "longitude": 130.941
      },
      {
        "name": "宇部市",
        "latitude": 33.9518,
        "longitude": 131.2473
      },
      {
        "name": "山口市",
        "latitude": 34.1778,
        "longitude": 131.473
      },
      {
        "name": "萩市",
        "latitude": 34.4081,
        "longitude": 131.3992
      },
      {
        "name": "防府市",
        "latitude": 34.0514,
        "longitude": 131.5628
      },
      {
        "name": "下松市",
        "latitude": 34.015,
        "longitude": 131.8703
      },
      {
        "name": "岩国市",
        "latitude": 34.1666,
        "longitude": 132.2188
      },
      {
        "name": "光市",
        "latitude": 33.9619,
        "longitude": 131.9421
      },
      {
        "name": "長門市",
        "latitude": 34.3706,
        "longitude": 131.1826
      },
      {
        "name": "柳井市",
        "latitude": 33.9639,
        "longitude": 132.1017
      },
      {
        "name": "美祢市",
        "latitude": 34.1667,
        "longitude": 131.2062
      },
      {
        "name": "周南市",
        "latitude": 34.0557,
        "longitude": 131.8066
      },
      {
        "name": "山陽小野田市",
        "latitude": 34.0032,
        "longitude": 131.1818
      },
      {
        "name": "周防大島町",
        "latitude": 33.9275,
        "longitude": 132.1953
      },
      {
        "name": "和木町",
        "latitude": 34.2024,
        "longitude": 132.2204
      },
      {
        "name": "上関町",
        "latitude": 33.8308,
        "longitude": 132.1102
      },
      {
        "name": "田布施町",
        "latitude": 33.9547,
        "longitude": 132.0414
      },
      {
        "name": "平生町",
        "latitude": 33.9382,
        "longitude": 132.0736
      },
      {
        "name": "阿武町",
        "latitude": 34.5033,
        "longitude": 131.4714
      }
    ]
  },
  {
    "prefecture": "徳島県",
    "municipalities": [
      {
        "name": "徳島市",
        "latitude": 34.0701,
        "longitude": 134.5547
      },
      {
        "name": "鳴門市",
        "latitude": 34.1729,
        "longitude": 134.6089
      },
      {
        "name": "小松島市",
        "latitude": 34.0047,
        "longitude": 134.5907
      },
      {
        "name": "阿南市",
        "latitude": 33.9218,
        "longitude": 134.6595
      },
      {
        "name": "吉野川市",
        "latitude": 34.0664,
        "longitude": 134.3586
      },
      {
        "name": "阿波市",
        "latitude": 34.1021,
        "longitude": 134.2975
      },
      {
        "name": "美馬市",
        "latitude": 34.0538,
        "longitude": 134.1697
      },
      {
        "name": "三好市",
        "latitude": 34.0264,
        "longitude": 133.8071
      },
      {
        "name": "勝浦町",
        "latitude": 33.9315,
        "longitude": 134.5114
      },
      {
        "name": "上勝町",
        "latitude": 33.889,
        "longitude": 134.4018
      },
      {
        "name": "佐那河内村",
        "latitude": 33.9938,
        "longitude": 134.4578
      },
      {
        "name": "石井町",
        "latitude": 34.0741,
        "longitude": 134.4407
      },
      {
        "name": "神山町",
        "latitude": 33.9672,
        "longitude": 134.3505
      },
      {
        "name": "那賀町",
        "latitude": 33.8574,
        "longitude": 134.4966
      },
      {
        "name": "牟岐町",
        "latitude": 33.6683,
        "longitude": 134.4207
      },
      {
        "name": "美波町",
        "latitude": 33.7346,
        "longitude": 134.5355
      },
      {
        "name": "海陽町",
        "latitude": 33.602,
        "longitude": 134.352
      },
      {
        "name": "松茂町",
        "latitude": 34.1338,
        "longitude": 134.5806
      },
      {
        "name": "北島町",
        "latitude": 34.1256,
        "longitude": 134.547
      },
      {
        "name": "藍住町",
        "latitude": 34.1266,
        "longitude": 134.4951
      },
      {
        "name": "板野町",
        "latitude": 34.1444,
        "longitude": 134.4626
      },
      {
        "name": "上板町",
        "latitude": 34.1214,
        "longitude": 134.405
      },
      {
        "name": "つるぎ町",
        "latitude": 34.0373,
        "longitude": 134.064
      },
      {
        "name": "東みよし町",
        "latitude": 34.0367,
        "longitude": 133.9369
      }
    ]
  },
  {
    "prefecture": "香川県",
    "municipalities": [
      {
        "name": "高松市",
        "latitude": 34.3428,
        "longitude": 134.0465
      },
      {
        "name": "丸亀市",
        "latitude": 34.2899,
        "longitude": 133.7987
      },
      {
        "name": "坂出市",
        "latitude": 34.3167,
        "longitude": 133.8605
      },
      {
        "name": "善通寺市",
        "latitude": 34.2272,
        "longitude": 133.7872
      },
      {
        "name": "観音寺市",
        "latitude": 34.1285,
        "longitude": 133.6629
      },
      {
        "name": "さぬき市",
        "latitude": 34.3253,
        "longitude": 134.1721
      },
      {
        "name": "東かがわ市",
        "latitude": 34.2438,
        "longitude": 134.3588
      },
      {
        "name": "三豊市",
        "latitude": 34.1827,
        "longitude": 133.7151
      },
      {
        "name": "土庄町",
        "latitude": 34.4867,
        "longitude": 134.1886
      },
      {
        "name": "小豆島町",
        "latitude": 34.4797,
        "longitude": 134.3089
      },
      {
        "name": "三木町",
        "latitude": 34.2683,
        "longitude": 134.1344
      },
      {
        "name": "直島町",
        "latitude": 34.4598,
        "longitude": 133.9956
      },
      {
        "name": "宇多津町",
        "latitude": 34.3103,
        "longitude": 133.8255
      },
      {
        "name": "綾川町",
        "latitude": 34.2496,
        "longitude": 133.9231
      },
      {
        "name": "琴平町",
        "latitude": 34.1914,
        "longitude": 133.8233
      },
      {
        "name": "多度津町",
        "latitude": 34.2727,
        "longitude": 133.7586
      },
      {
        "name": "まんのう町",
        "latitude": 34.1923,
        "longitude": 133.8415
      }
    ]
  },
  {
    "prefecture": "愛媛県",
    "municipalities": [
      {
        "name": "松山市",
        "latitude": 33.8392,
        "longitude": 132.7656
      },
      {
        "name": "今治市",
        "latitude": 34.0662,
        "longitude": 132.9978
      },
      {
        "name": "宇和島市",
        "latitude": 33.2233,
        "longitude": 132.5609
      },
      {
        "name": "八幡浜市",
        "latitude": 33.4629,
        "longitude": 132.4234
      },
      {
        "name": "新居浜市",
        "latitude": 33.9603,
        "longitude": 133.2834
      },
      {
        "name": "西条市",
        "latitude": 33.9195,
        "longitude": 133.1811
      },
      {
        "name": "大洲市",
        "latitude": 33.5062,
        "longitude": 132.5445
      },
      {
        "name": "伊予市",
        "latitude": 33.7577,
        "longitude": 132.7038
      },
      {
        "name": "四国中央市",
        "latitude": 33.9806,
        "longitude": 133.55
      },
      {
        "name": "西予市",
        "latitude": 33.3627,
        "longitude": 132.5109
      },
      {
        "name": "東温市",
        "latitude": 33.791,
        "longitude": 132.8723
      },
      {
        "name": "上島町",
        "latitude": 34.2576,
        "longitude": 133.2044
      },
      {
        "name": "久万高原町",
        "latitude": 33.6556,
        "longitude": 132.9017
      },
      {
        "name": "松前町",
        "latitude": 33.7875,
        "longitude": 132.7114
      },
      {
        "name": "砥部町",
        "latitude": 33.7492,
        "longitude": 132.7923
      },
      {
        "name": "内子町",
        "latitude": 33.533,
        "longitude": 132.6581
      },
      {
        "name": "伊方町",
        "latitude": 33.4886,
        "longitude": 132.3542
      },
      {
        "name": "松野町",
        "latitude": 33.2271,
        "longitude": 132.7113
      },
      {
        "name": "鬼北町",
        "latitude": 33.2559,
        "longitude": 132.6841
      },
      {
        "name": "愛南町",
        "latitude": 32.9625,
        "longitude": 132.5834
      }
    ]
  },
  {
    "prefecture": "高知県",
    "municipalities": [
      {
        "name": "高知市",
        "latitude": 33.5587,
        "longitude": 133.5311
      },
      {
        "name": "室戸市",
        "latitude": 33.2899,
        "longitude": 134.152
      },
      {
        "name": "安芸市",
        "latitude": 33.5164,
        "longitude": 133.9058
      },
      {
        "name": "南国市",
        "latitude": 33.5757,
        "longitude": 133.6415
      },
      {
        "name": "土佐市",
        "latitude": 33.496,
        "longitude": 133.425
      },
      {
        "name": "須崎市",
        "latitude": 33.4007,
        "longitude": 133.283
      },
      {
        "name": "宿毛市",
        "latitude": 32.934,
        "longitude": 132.702
      },
      {
        "name": "土佐清水市",
        "latitude": 32.7816,
        "longitude": 132.9549
      },
      {
        "name": "四万十市",
        "latitude": 32.9914,
        "longitude": 132.9337
      },
      {
        "name": "香南市",
        "latitude": 33.5644,
        "longitude": 133.7008
      },
      {
        "name": "香美市",
        "latitude": 33.6038,
        "longitude": 133.6858
      },
      {
        "name": "東洋町",
        "latitude": 33.528,
        "longitude": 134.2801
      },
      {
        "name": "奈半利町",
        "latitude": 33.4242,
        "longitude": 134.021
      },
      {
        "name": "田野町",
        "latitude": 33.4277,
        "longitude": 134.0082
      },
      {
        "name": "安田町",
        "latitude": 33.4391,
        "longitude": 133.9812
      },
      {
        "name": "北川村",
        "latitude": 33.4478,
        "longitude": 134.0422
      },
      {
        "name": "馬路村",
        "latitude": 33.5553,
        "longitude": 134.0481
      },
      {
        "name": "芸西村",
        "latitude": 33.5269,
        "longitude": 133.8088
      },
      {
        "name": "本山町",
        "latitude": 33.7597,
        "longitude": 133.5867
      },
      {
        "name": "大豊町",
        "latitude": 33.7687,
        "longitude": 133.643
      },
      {
        "name": "土佐町",
        "latitude": 33.737,
        "longitude": 133.5318
      },
      {
        "name": "大川村",
        "latitude": 33.7837,
        "longitude": 133.4666
      },
      {
        "name": "いの町",
        "latitude": 33.5487,
        "longitude": 133.4278
      },
      {
        "name": "仁淀川町",
        "latitude": 33.5753,
        "longitude": 133.171
      },
      {
        "name": "中土佐町",
        "latitude": 33.3293,
        "longitude": 133.2248
      },
      {
        "name": "佐川町",
        "latitude": 33.5008,
        "longitude": 133.2867
      },
      {
        "name": "越知町",
        "latitude": 33.5329,
        "longitude": 133.2522
      },
      {
        "name": "梼原町",
        "latitude": 33.3922,
        "longitude": 132.927
      },
      {
        "name": "日高村",
        "latitude": 33.5351,
        "longitude": 133.3732
      },
      {
        "name": "津野町",
        "latitude": 33.4467,
        "longitude": 133.1994
      },
      {
        "name": "四万十町",
        "latitude": 33.2116,
        "longitude": 133.137
      },
      {
        "name": "大月町",
        "latitude": 32.8415,
        "longitude": 132.707
      },
      {
        "name": "三原村",
        "latitude": 32.9061,
        "longitude": 132.8473
      },
      {
        "name": "黒潮町",
        "latitude": 33.025,
        "longitude": 133.0042
      }
    ]
  },
  {
    "prefecture": "福岡県",
    "municipalities": [
      {
        "name": "北九州市",
        "latitude": 33.8834,
        "longitude": 130.8752
      },
      {
        "name": "福岡市",
        "latitude": 33.59,
        "longitude": 130.4017
      },
      {
        "name": "大牟田市",
        "latitude": 33.0303,
        "longitude": 130.4461
      },
      {
        "name": "久留米市",
        "latitude": 33.3192,
        "longitude": 130.5084
      },
      {
        "name": "直方市",
        "latitude": 33.744,
        "longitude": 130.7296
      },
      {
        "name": "飯塚市",
        "latitude": 33.6466,
        "longitude": 130.6911
      },
      {
        "name": "田川市",
        "latitude": 33.6389,
        "longitude": 130.8061
      },
      {
        "name": "柳川市",
        "latitude": 33.1631,
        "longitude": 130.4061
      },
      {
        "name": "八女市",
        "latitude": 33.2114,
        "longitude": 130.5582
      },
      {
        "name": "筑後市",
        "latitude": 33.2124,
        "longitude": 130.502
      },
      {
        "name": "大川市",
        "latitude": 33.2066,
        "longitude": 130.384
      },
      {
        "name": "行橋市",
        "latitude": 33.7288,
        "longitude": 130.983
      },
      {
        "name": "豊前市",
        "latitude": 33.6115,
        "longitude": 131.13
      },
      {
        "name": "中間市",
        "latitude": 33.8167,
        "longitude": 130.7092
      },
      {
        "name": "小郡市",
        "latitude": 33.3964,
        "longitude": 130.5556
      },
      {
        "name": "筑紫野市",
        "latitude": 33.4874,
        "longitude": 130.526
      },
      {
        "name": "春日市",
        "latitude": 33.5328,
        "longitude": 130.4703
      },
      {
        "name": "大野城市",
        "latitude": 33.5363,
        "longitude": 130.4787
      },
      {
        "name": "宗像市",
        "latitude": 33.8056,
        "longitude": 130.5406
      },
      {
        "name": "太宰府市",
        "latitude": 33.5128,
        "longitude": 130.5239
      },
      {
        "name": "古賀市",
        "latitude": 33.7288,
        "longitude": 130.47
      },
      {
        "name": "福津市",
        "latitude": 33.7669,
        "longitude": 130.4911
      },
      {
        "name": "うきは市",
        "latitude": 33.3474,
        "longitude": 130.755
      },
      {
        "name": "宮若市",
        "latitude": 33.7236,
        "longitude": 130.6674
      },
      {
        "name": "嘉麻市",
        "latitude": 33.5984,
        "longitude": 130.7192
      },
      {
        "name": "朝倉市",
        "latitude": 33.4233,
        "longitude": 130.6656
      },
      {
        "name": "みやま市",
        "latitude": 33.1525,
        "longitude": 130.4747
      },
      {
        "name": "糸島市",
        "latitude": 33.5572,
        "longitude": 130.1963
      },
      {
        "name": "那珂川市",
        "latitude": 33.4996,
        "longitude": 130.4222
      },
      {
        "name": "宇美町",
        "latitude": 33.5678,
        "longitude": 130.5111
      },
      {
        "name": "篠栗町",
        "latitude": 33.6239,
        "longitude": 130.5264
      },
      {
        "name": "志免町",
        "latitude": 33.5915,
        "longitude": 130.4798
      },
      {
        "name": "須恵町",
        "latitude": 33.5872,
        "longitude": 130.5072
      },
      {
        "name": "新宮町",
        "latitude": 33.7153,
        "longitude": 130.4467
      },
      {
        "name": "久山町",
        "latitude": 33.6467,
        "longitude": 130.5
      },
      {
        "name": "粕屋町",
        "latitude": 33.6108,
        "longitude": 130.4806
      },
      {
        "name": "芦屋町",
        "latitude": 33.8939,
        "longitude": 130.6638
      },
      {
        "name": "水巻町",
        "latitude": 33.8547,
        "longitude": 130.6947
      },
      {
        "name": "岡垣町",
        "latitude": 33.8536,
        "longitude": 130.6114
      },
      {
        "name": "遠賀町",
        "latitude": 33.8481,
        "longitude": 130.6683
      },
      {
        "name": "小竹町",
        "latitude": 33.6965,
        "longitude": 130.708
      },
      {
        "name": "鞍手町",
        "latitude": 33.7929,
        "longitude": 130.6924
      },
      {
        "name": "桂川町",
        "latitude": 33.5789,
        "longitude": 130.6781
      },
      {
        "name": "筑前町",
        "latitude": 33.4569,
        "longitude": 130.5953
      },
      {
        "name": "東峰村",
        "latitude": 33.3973,
        "longitude": 130.8701
      },
      {
        "name": "大刀洗町",
        "latitude": 33.3724,
        "longitude": 130.6226
      },
      {
        "name": "大木町",
        "latitude": 33.2106,
        "longitude": 130.4397
      },
      {
        "name": "広川町",
        "latitude": 33.2412,
        "longitude": 130.5514
      },
      {
        "name": "香春町",
        "latitude": 33.668,
        "longitude": 130.8474
      },
      {
        "name": "添田町",
        "latitude": 33.5717,
        "longitude": 130.854
      },
      {
        "name": "糸田町",
        "latitude": 33.6528,
        "longitude": 130.7792
      },
      {
        "name": "川崎町",
        "latitude": 33.6,
        "longitude": 130.815
      },
      {
        "name": "大任町",
        "latitude": 33.6123,
        "longitude": 130.8537
      },
      {
        "name": "赤村",
        "latitude": 33.6167,
        "longitude": 130.8708
      },
      {
        "name": "福智町",
        "latitude": 33.6833,
        "longitude": 130.78
      },
      {
        "name": "苅田町",
        "latitude": 33.776,
        "longitude": 130.9805
      },
      {
        "name": "みやこ町",
        "latitude": 33.6992,
        "longitude": 130.9206
      },
      {
        "name": "吉富町",
        "latitude": 33.6026,
        "longitude": 131.1761
      },
      {
        "name": "上毛町",
        "latitude": 33.5783,
        "longitude": 131.1644
      },
      {
        "name": "築上町",
        "latitude": 33.6564,
        "longitude": 131.0558
      },
      {
        "name": "北九州市門司区",
        "latitude": 33.9412,
        "longitude": 130.9597
      },
      {
        "name": "北九州市若松区",
        "latitude": 33.9054,
        "longitude": 130.8112
      },
      {
        "name": "北九州市戸畑区",
        "latitude": 33.8936,
        "longitude": 130.8299
      },
      {
        "name": "北九州市小倉北区",
        "latitude": 33.8808,
        "longitude": 130.8735
      },
      {
        "name": "北九州市小倉南区",
        "latitude": 33.8464,
        "longitude": 130.8848
      },
      {
        "name": "北九州市八幡東区",
        "latitude": 33.8635,
        "longitude": 130.8119
      },
      {
        "name": "北九州市八幡西区",
        "latitude": 33.8664,
        "longitude": 130.7643
      },
      {
        "name": "福岡市東区",
        "latitude": 33.6178,
        "longitude": 130.4175
      },
      {
        "name": "福岡市博多区",
        "latitude": 33.5909,
        "longitude": 130.4144
      },
      {
        "name": "福岡市中央区",
        "latitude": 33.5892,
        "longitude": 130.3928
      },
      {
        "name": "福岡市南区",
        "latitude": 33.5616,
        "longitude": 130.4264
      },
      {
        "name": "福岡市西区",
        "latitude": 33.5828,
        "longitude": 130.3231
      },
      {
        "name": "福岡市城南区",
        "latitude": 33.5757,
        "longitude": 130.3699
      },
      {
        "name": "福岡市早良区",
        "latitude": 33.5818,
        "longitude": 130.3485
      }
    ]
  },
  {
    "prefecture": "佐賀県",
    "municipalities": [
      {
        "name": "佐賀市",
        "latitude": 33.2635,
        "longitude": 130.3009
      },
      {
        "name": "唐津市",
        "latitude": 33.4498,
        "longitude": 129.9677
      },
      {
        "name": "鳥栖市",
        "latitude": 33.3781,
        "longitude": 130.505
      },
      {
        "name": "多久市",
        "latitude": 33.2886,
        "longitude": 130.1103
      },
      {
        "name": "伊万里市",
        "latitude": 33.2647,
        "longitude": 129.8808
      },
      {
        "name": "武雄市",
        "latitude": 33.1949,
        "longitude": 130.0216
      },
      {
        "name": "鹿島市",
        "latitude": 33.1038,
        "longitude": 130.0985
      },
      {
        "name": "小城市",
        "latitude": 33.2737,
        "longitude": 130.2168
      },
      {
        "name": "嬉野市",
        "latitude": 33.1278,
        "longitude": 130.06
      },
      {
        "name": "神埼市",
        "latitude": 33.3116,
        "longitude": 130.3718
      },
      {
        "name": "吉野ヶ里町",
        "latitude": 33.3211,
        "longitude": 130.3989
      },
      {
        "name": "基山町",
        "latitude": 33.4269,
        "longitude": 130.5231
      },
      {
        "name": "上峰町",
        "latitude": 33.3196,
        "longitude": 130.4262
      },
      {
        "name": "みやき町",
        "latitude": 33.3246,
        "longitude": 130.4544
      },
      {
        "name": "玄海町",
        "latitude": 33.4722,
        "longitude": 129.8747
      },
      {
        "name": "有田町",
        "latitude": 33.2106,
        "longitude": 129.8492
      },
      {
        "name": "大町町",
        "latitude": 33.2139,
        "longitude": 130.1161
      },
      {
        "name": "江北町",
        "latitude": 33.2206,
        "longitude": 130.1572
      },
      {
        "name": "白石町",
        "latitude": 33.181,
        "longitude": 130.1435
      },
      {
        "name": "太良町",
        "latitude": 33.0194,
        "longitude": 130.1792
      }
    ]
  },
  {
    "prefecture": "長崎県",
    "municipalities": [
      {
        "name": "長崎市",
        "latitude": 32.7495,
        "longitude": 129.8798
      },
      {
        "name": "佐世保市",
        "latitude": 33.1799,
        "longitude": 129.7151
      },
      {
        "name": "島原市",
        "latitude": 32.788,
        "longitude": 130.3702
      },
      {
        "name": "諫早市",
        "latitude": 32.8434,
        "longitude": 130.0532
      },
      {
        "name": "大村市",
        "latitude": 32.9,
        "longitude": 129.9583
      },
      {
        "name": "平戸市",
        "latitude": 33.368,
        "longitude": 129.5537
      },
      {
        "name": "松浦市",
        "latitude": 33.341,
        "longitude": 129.7091
      },
      {
        "name": "対馬市",
        "latitude": 34.2028,
        "longitude": 129.2875
      },
      {
        "name": "壱岐市",
        "latitude": 33.75,
        "longitude": 129.6913
      },
      {
        "name": "五島市",
        "latitude": 32.6958,
        "longitude": 128.8409
      },
      {
        "name": "西海市",
        "latitude": 32.9331,
        "longitude": 129.6431
      },
      {
        "name": "雲仙市",
        "latitude": 32.835,
        "longitude": 130.1875
      },
      {
        "name": "南島原市",
        "latitude": 32.6597,
        "longitude": 130.2978
      },
      {
        "name": "長与町",
        "latitude": 32.8252,
        "longitude": 129.875
      },
      {
        "name": "時津町",
        "latitude": 32.8289,
        "longitude": 129.8486
      },
      {
        "name": "東彼杵町",
        "latitude": 33.037,
        "longitude": 129.9171
      },
      {
        "name": "川棚町",
        "latitude": 33.0727,
        "longitude": 129.8616
      },
      {
        "name": "波佐見町",
        "latitude": 33.1384,
        "longitude": 129.8954
      },
      {
        "name": "小値賀町",
        "latitude": 33.191,
        "longitude": 129.0589
      },
      {
        "name": "佐々町",
        "latitude": 33.238,
        "longitude": 129.6509
      },
      {
        "name": "新上五島町",
        "latitude": 32.9844,
        "longitude": 129.0733
      }
    ]
  },
  {
    "prefecture": "熊本県",
    "municipalities": [
      {
        "name": "熊本市",
        "latitude": 32.8033,
        "longitude": 130.7081
      },
      {
        "name": "八代市",
        "latitude": 32.5075,
        "longitude": 130.6018
      },
      {
        "name": "人吉市",
        "latitude": 32.2056,
        "longitude": 130.7602
      },
      {
        "name": "荒尾市",
        "latitude": 32.9867,
        "longitude": 130.4333
      },
      {
        "name": "水俣市",
        "latitude": 32.2118,
        "longitude": 130.4086
      },
      {
        "name": "玉名市",
        "latitude": 32.9353,
        "longitude": 130.5629
      },
      {
        "name": "山鹿市",
        "latitude": 33.0176,
        "longitude": 130.6914
      },
      {
        "name": "菊池市",
        "latitude": 32.9797,
        "longitude": 130.8132
      },
      {
        "name": "宇土市",
        "latitude": 32.6873,
        "longitude": 130.6585
      },
      {
        "name": "上天草市",
        "latitude": 32.5875,
        "longitude": 130.4306
      },
      {
        "name": "宇城市",
        "latitude": 32.6478,
        "longitude": 130.6844
      },
      {
        "name": "阿蘇市",
        "latitude": 32.9521,
        "longitude": 131.1213
      },
      {
        "name": "天草市",
        "latitude": 32.4589,
        "longitude": 130.1935
      },
      {
        "name": "合志市",
        "latitude": 32.886,
        "longitude": 130.7897
      },
      {
        "name": "美里町",
        "latitude": 32.6397,
        "longitude": 130.7889
      },
      {
        "name": "玉東町",
        "latitude": 32.9193,
        "longitude": 130.6286
      },
      {
        "name": "南関町",
        "latitude": 33.0596,
        "longitude": 130.5436
      },
      {
        "name": "長洲町",
        "latitude": 32.9297,
        "longitude": 130.4528
      },
      {
        "name": "和水町",
        "latitude": 32.9781,
        "longitude": 130.6058
      },
      {
        "name": "大津町",
        "latitude": 32.878,
        "longitude": 130.8686
      },
      {
        "name": "菊陽町",
        "latitude": 32.8625,
        "longitude": 130.8286
      },
      {
        "name": "南小国町",
        "latitude": 33.0986,
        "longitude": 131.0705
      },
      {
        "name": "小国町",
        "latitude": 33.1214,
        "longitude": 131.0683
      },
      {
        "name": "産山村",
        "latitude": 32.9955,
        "longitude": 131.2167
      },
      {
        "name": "高森町",
        "latitude": 32.8272,
        "longitude": 131.1219
      },
      {
        "name": "西原村",
        "latitude": 32.8347,
        "longitude": 130.9031
      },
      {
        "name": "南阿蘇村",
        "latitude": 32.8451,
        "longitude": 131.0178
      },
      {
        "name": "御船町",
        "latitude": 32.7146,
        "longitude": 130.8019
      },
      {
        "name": "嘉島町",
        "latitude": 32.74,
        "longitude": 130.7572
      },
      {
        "name": "益城町",
        "latitude": 32.7916,
        "longitude": 130.8163
      },
      {
        "name": "甲佐町",
        "latitude": 32.6512,
        "longitude": 130.8112
      },
      {
        "name": "山都町",
        "latitude": 32.6854,
        "longitude": 130.9904
      },
      {
        "name": "氷川町",
        "latitude": 32.5825,
        "longitude": 130.6736
      },
      {
        "name": "芦北町",
        "latitude": 32.299,
        "longitude": 130.4931
      },
      {
        "name": "津奈木町",
        "latitude": 32.2339,
        "longitude": 130.4396
      },
      {
        "name": "錦町",
        "latitude": 32.2011,
        "longitude": 130.8411
      },
      {
        "name": "多良木町",
        "latitude": 32.264,
        "longitude": 130.9358
      },
      {
        "name": "湯前町",
        "latitude": 32.2761,
        "longitude": 130.981
      },
      {
        "name": "水上村",
        "latitude": 32.3144,
        "longitude": 131.0094
      },
      {
        "name": "相良村",
        "latitude": 32.2353,
        "longitude": 130.7981
      },
      {
        "name": "五木村",
        "latitude": 32.3973,
        "longitude": 130.8278
      },
      {
        "name": "山江村",
        "latitude": 32.2468,
        "longitude": 130.7668
      },
      {
        "name": "球磨村",
        "latitude": 32.2524,
        "longitude": 130.6513
      },
      {
        "name": "あさぎり町",
        "latitude": 32.2403,
        "longitude": 130.8981
      },
      {
        "name": "苓北町",
        "latitude": 32.5131,
        "longitude": 130.0547
      },
      {
        "name": "熊本市",
        "latitude": 32.8033,
        "longitude": 130.7081
      },
      {
        "name": "熊本市中央区",
        "latitude": 32.8033,
        "longitude": 130.7081
      },
      {
        "name": "熊本市東区",
        "latitude": 32.7805,
        "longitude": 130.7681
      },
      {
        "name": "熊本市西区",
        "latitude": 32.7765,
        "longitude": 130.6476
      },
      {
        "name": "熊本市南区",
        "latitude": 32.7153,
        "longitude": 130.6789
      },
      {
        "name": "熊本市北区",
        "latitude": 32.9036,
        "longitude": 130.6943
      }
    ]
  },
  {
    "prefecture": "大分県",
    "municipalities": [
      {
        "name": "大分市",
        "latitude": 33.2394,
        "longitude": 131.6097
      },
      {
        "name": "別府市",
        "latitude": 33.2847,
        "longitude": 131.4911
      },
      {
        "name": "中津市",
        "latitude": 33.5983,
        "longitude": 131.1883
      },
      {
        "name": "日田市",
        "latitude": 33.3211,
        "longitude": 130.9414
      },
      {
        "name": "佐伯市",
        "latitude": 32.9598,
        "longitude": 131.9
      },
      {
        "name": "臼杵市",
        "latitude": 33.1258,
        "longitude": 131.8047
      },
      {
        "name": "津久見市",
        "latitude": 33.0723,
        "longitude": 131.8612
      },
      {
        "name": "竹田市",
        "latitude": 32.9735,
        "longitude": 131.3982
      },
      {
        "name": "豊後高田市",
        "latitude": 33.5562,
        "longitude": 131.4471
      },
      {
        "name": "杵築市",
        "latitude": 33.417,
        "longitude": 131.6161
      },
      {
        "name": "宇佐市",
        "latitude": 33.5323,
        "longitude": 131.3503
      },
      {
        "name": "豊後大野市",
        "latitude": 32.9776,
        "longitude": 131.5841
      },
      {
        "name": "由布市",
        "latitude": 33.1801,
        "longitude": 131.4268
      },
      {
        "name": "国東市",
        "latitude": 33.5633,
        "longitude": 131.7323
      },
      {
        "name": "姫島村",
        "latitude": 33.7245,
        "longitude": 131.6452
      },
      {
        "name": "日出町",
        "latitude": 33.3694,
        "longitude": 131.5325
      },
      {
        "name": "九重町",
        "latitude": 33.2283,
        "longitude": 131.1889
      },
      {
        "name": "玖珠町",
        "latitude": 33.2832,
        "longitude": 131.1516
      }
    ]
  },
  {
    "prefecture": "宮崎県",
    "municipalities": [
      {
        "name": "宮崎市",
        "latitude": 31.9077,
        "longitude": 131.4203
      },
      {
        "name": "都城市",
        "latitude": 31.7196,
        "longitude": 131.0614
      },
      {
        "name": "延岡市",
        "latitude": 32.5822,
        "longitude": 131.6651
      },
      {
        "name": "日南市",
        "latitude": 31.6018,
        "longitude": 131.3788
      },
      {
        "name": "小林市",
        "latitude": 31.9968,
        "longitude": 130.973
      },
      {
        "name": "日向市",
        "latitude": 32.4225,
        "longitude": 131.6244
      },
      {
        "name": "串間市",
        "latitude": 31.4647,
        "longitude": 131.2286
      },
      {
        "name": "西都市",
        "latitude": 32.1079,
        "longitude": 131.401
      },
      {
        "name": "えびの市",
        "latitude": 32.0456,
        "longitude": 130.8111
      },
      {
        "name": "三股町",
        "latitude": 31.7307,
        "longitude": 131.125
      },
      {
        "name": "高原町",
        "latitude": 31.9283,
        "longitude": 131.0078
      },
      {
        "name": "国富町",
        "latitude": 31.9907,
        "longitude": 131.3235
      },
      {
        "name": "綾町",
        "latitude": 31.9991,
        "longitude": 131.2529
      },
      {
        "name": "高鍋町",
        "latitude": 32.128,
        "longitude": 131.5033
      },
      {
        "name": "新富町",
        "latitude": 32.069,
        "longitude": 131.4878
      },
      {
        "name": "西米良村",
        "latitude": 32.2264,
        "longitude": 131.1544
      },
      {
        "name": "木城町",
        "latitude": 32.1639,
        "longitude": 131.4733
      },
      {
        "name": "川南町",
        "latitude": 32.1919,
        "longitude": 131.5258
      },
      {
        "name": "都農町",
        "latitude": 32.2567,
        "longitude": 131.5597
      },
      {
        "name": "門川町",
        "latitude": 32.4709,
        "longitude": 131.6465
      },
      {
        "name": "諸塚村",
        "latitude": 32.5122,
        "longitude": 131.3303
      },
      {
        "name": "椎葉村",
        "latitude": 32.4673,
        "longitude": 131.1583
      },
      {
        "name": "美郷町",
        "latitude": 32.4403,
        "longitude": 131.4232
      },
      {
        "name": "高千穂町",
        "latitude": 32.7117,
        "longitude": 131.3078
      },
      {
        "name": "日之影町",
        "latitude": 32.6594,
        "longitude": 131.3809
      },
      {
        "name": "五ヶ瀬町",
        "latitude": 32.6834,
        "longitude": 131.1969
      }
    ]
  },
  {
    "prefecture": "鹿児島県",
    "municipalities": [
      {
        "name": "鹿児島市",
        "latitude": 31.5969,
        "longitude": 130.557
      },
      {
        "name": "鹿屋市",
        "latitude": 31.3783,
        "longitude": 130.8522
      },
      {
        "name": "枕崎市",
        "latitude": 31.2728,
        "longitude": 130.2969
      },
      {
        "name": "阿久根市",
        "latitude": 32.0144,
        "longitude": 130.1928
      },
      {
        "name": "出水市",
        "latitude": 32.0903,
        "longitude": 130.3532
      },
      {
        "name": "指宿市",
        "latitude": 31.2528,
        "longitude": 130.6331
      },
      {
        "name": "西之表市",
        "latitude": 30.7324,
        "longitude": 130.997
      },
      {
        "name": "垂水市",
        "latitude": 31.4928,
        "longitude": 130.7009
      },
      {
        "name": "薩摩川内市",
        "latitude": 31.8133,
        "longitude": 130.3042
      },
      {
        "name": "日置市",
        "latitude": 31.6337,
        "longitude": 130.4024
      },
      {
        "name": "曽於市",
        "latitude": 31.6536,
        "longitude": 131.0192
      },
      {
        "name": "霧島市",
        "latitude": 31.7409,
        "longitude": 130.7633
      },
      {
        "name": "いちき串木野市",
        "latitude": 31.7146,
        "longitude": 130.2719
      },
      {
        "name": "南さつま市",
        "latitude": 31.4167,
        "longitude": 130.3233
      },
      {
        "name": "志布志市",
        "latitude": 31.4775,
        "longitude": 131.0998
      },
      {
        "name": "奄美市",
        "latitude": 28.3777,
        "longitude": 129.4938
      },
      {
        "name": "南九州市",
        "latitude": 31.3783,
        "longitude": 130.4417
      },
      {
        "name": "伊佐市",
        "latitude": 32.0572,
        "longitude": 130.6131
      },
      {
        "name": "姶良市",
        "latitude": 31.7284,
        "longitude": 130.6277
      },
      {
        "name": "三島村",
        "latitude": 31.5945,
        "longitude": 130.5607
      },
      {
        "name": "十島村",
        "latitude": 31.5932,
        "longitude": 130.5606
      },
      {
        "name": "さつま町",
        "latitude": 31.9058,
        "longitude": 130.4558
      },
      {
        "name": "長島町",
        "latitude": 32.1992,
        "longitude": 130.1769
      },
      {
        "name": "湧水町",
        "latitude": 31.9517,
        "longitude": 130.7211
      },
      {
        "name": "大崎町",
        "latitude": 31.4292,
        "longitude": 131.0058
      },
      {
        "name": "東串良町",
        "latitude": 31.3855,
        "longitude": 130.9734
      },
      {
        "name": "錦江町",
        "latitude": 31.2435,
        "longitude": 130.7877
      },
      {
        "name": "南大隅町",
        "latitude": 31.2173,
        "longitude": 130.7686
      },
      {
        "name": "肝付町",
        "latitude": 31.3447,
        "longitude": 130.9453
      },
      {
        "name": "中種子町",
        "latitude": 30.5331,
        "longitude": 130.9586
      },
      {
        "name": "南種子町",
        "latitude": 30.414,
        "longitude": 130.9009
      },
      {
        "name": "屋久島町",
        "latitude": 30.3902,
        "longitude": 130.6511
      },
      {
        "name": "大和村",
        "latitude": 28.3581,
        "longitude": 129.3953
      },
      {
        "name": "宇検村",
        "latitude": 28.2808,
        "longitude": 129.2973
      },
      {
        "name": "瀬戸内町",
        "latitude": 28.1465,
        "longitude": 129.3147
      },
      {
        "name": "龍郷町",
        "latitude": 28.4131,
        "longitude": 129.5894
      },
      {
        "name": "喜界町",
        "latitude": 28.3169,
        "longitude": 129.94
      },
      {
        "name": "徳之島町",
        "latitude": 27.7264,
        "longitude": 129.0187
      },
      {
        "name": "天城町",
        "latitude": 27.8117,
        "longitude": 128.8977
      },
      {
        "name": "伊仙町",
        "latitude": 27.6732,
        "longitude": 128.9377
      },
      {
        "name": "和泊町",
        "latitude": 27.392,
        "longitude": 128.6555
      },
      {
        "name": "知名町",
        "latitude": 27.3386,
        "longitude": 128.5739
      },
      {
        "name": "与論町",
        "latitude": 27.0449,
        "longitude": 128.4216
      }
    ]
  },
  {
    "prefecture": "沖縄県",
    "municipalities": [
      {
        "name": "那覇市",
        "latitude": 26.2124,
        "longitude": 127.6791
      },
      {
        "name": "宜野湾市",
        "latitude": 26.2817,
        "longitude": 127.7784
      },
      {
        "name": "石垣市",
        "latitude": 24.3444,
        "longitude": 124.1852
      },
      {
        "name": "浦添市",
        "latitude": 26.2457,
        "longitude": 127.7218
      },
      {
        "name": "名護市",
        "latitude": 26.5917,
        "longitude": 127.9775
      },
      {
        "name": "糸満市",
        "latitude": 26.1235,
        "longitude": 127.6658
      },
      {
        "name": "沖縄市",
        "latitude": 26.3342,
        "longitude": 127.8056
      },
      {
        "name": "豊見城市",
        "latitude": 26.1771,
        "longitude": 127.6812
      },
      {
        "name": "うるま市",
        "latitude": 26.3788,
        "longitude": 127.8582
      },
      {
        "name": "宮古島市",
        "latitude": 24.79,
        "longitude": 125.2948
      },
      {
        "name": "南城市",
        "latitude": 26.1632,
        "longitude": 127.7706
      },
      {
        "name": "国頭村",
        "latitude": 26.7457,
        "longitude": 128.1783
      },
      {
        "name": "大宜味村",
        "latitude": 26.7018,
        "longitude": 128.1201
      },
      {
        "name": "東村",
        "latitude": 26.6334,
        "longitude": 128.1568
      },
      {
        "name": "今帰仁村",
        "latitude": 26.6828,
        "longitude": 127.9729
      },
      {
        "name": "本部町",
        "latitude": 26.6575,
        "longitude": 127.8978
      },
      {
        "name": "恩納村",
        "latitude": 26.4974,
        "longitude": 127.8537
      },
      {
        "name": "宜野座村",
        "latitude": 26.4816,
        "longitude": 127.9756
      },
      {
        "name": "金武町",
        "latitude": 26.4562,
        "longitude": 127.926
      },
      {
        "name": "伊江村",
        "latitude": 26.7134,
        "longitude": 127.8071
      },
      {
        "name": "読谷村",
        "latitude": 26.3961,
        "longitude": 127.7444
      },
      {
        "name": "嘉手納町",
        "latitude": 26.3618,
        "longitude": 127.7554
      },
      {
        "name": "北谷町",
        "latitude": 26.3201,
        "longitude": 127.7638
      },
      {
        "name": "北中城村",
        "latitude": 26.3007,
        "longitude": 127.7929
      },
      {
        "name": "中城村",
        "latitude": 26.262,
        "longitude": 127.7896
      },
      {
        "name": "西原町",
        "latitude": 26.223,
        "longitude": 127.7589
      },
      {
        "name": "与那原町",
        "latitude": 26.1996,
        "longitude": 127.7545
      },
      {
        "name": "南風原町",
        "latitude": 26.1911,
        "longitude": 127.7285
      },
      {
        "name": "渡嘉敷村",
        "latitude": 26.1975,
        "longitude": 127.3644
      },
      {
        "name": "座間味村",
        "latitude": 26.2289,
        "longitude": 127.3032
      },
      {
        "name": "粟国村",
        "latitude": 26.5818,
        "longitude": 127.2289
      },
      {
        "name": "渡名喜村",
        "latitude": 26.3721,
        "longitude": 127.1411
      },
      {
        "name": "南大東村",
        "latitude": 25.8288,
        "longitude": 131.2321
      },
      {
        "name": "北大東村",
        "latitude": 25.9458,
        "longitude": 131.299
      },
      {
        "name": "伊平屋村",
        "latitude": 27.0391,
        "longitude": 127.9687
      },
      {
        "name": "伊是名村",
        "latitude": 26.9237,
        "longitude": 127.9413
      },
      {
        "name": "久米島町",
        "latitude": 26.3407,
        "longitude": 126.8049
      },
      {
        "name": "八重瀬町",
        "latitude": 26.1583,
        "longitude": 127.7187
      },
      {
        "name": "多良間村",
        "latitude": 24.6693,
        "longitude": 124.7016
      },
      {
        "name": "竹富町",
        "latitude": 24.3395,
        "longitude": 124.1545
      },
      {
        "name": "与那国町",
        "latitude": 24.468,
        "longitude": 123.0046
      }
    ]
  }
];

export function findPrefecture(prefecture: string) {
  return japanLocations.find((location) => location.prefecture === prefecture) ?? japanLocations[0];
}
