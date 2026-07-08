// 各回の「図解」= その概念専用の固有SVG(世界の名著の図解ルールに準拠)。
// 型枠にはめず、概念が一番直感で入る"絵"を毎回設計する。matome.js が epId で引いて注入する。
// 配色は深夜FMスタジオ(濃紺#0F1220 / 琥珀#E8A04C / 緑#7DC98F / 朱#E4574F / 明朝)。
// 共通: viewBox 0 0 520 300、width:100% で可変。文字は枠内・衝突なし・横スクロールなし。

const AH = `<marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#E8A04C"/></marker>`;
const AHr = `<marker id="ahr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#E4574F"/></marker>`;
const AHm = `<marker id="ahm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#9BA0B4"/></marker>`;

export const diagrams = {

  // ep-1 社会的証明 — 雪だるま式に膨らむ行列(小さな差が転がって勝者総取り)
  "ep-1": `<svg viewBox="0 0 520 300" role="img" aria-label="坂を転がるほど大きくなる雪だるまで、行列の自己増幅を表す図">
    <defs>${AH}</defs>
    <text x="260" y="26" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">行列は、雪だるま式に膨らむ</text>
    <line x1="34" y1="96" x2="486" y2="248" stroke="#9BA0B4" stroke-width="1.4" opacity=".5"/>
    <path d="M430,196 C 350,44 150,44 96,104" fill="none" stroke="#C77F2E" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ah)"/>
    <text x="262" y="52" text-anchor="middle" font-size="11" fill="#C77F2E">⟲ わずかな初期差が増幅 ＝ 勝者総取り</text>
    <g fill="#1F2438" stroke="#E8A04C" stroke-width="1.6">
      <circle cx="95" cy="119" r="12"/><circle cx="200" cy="155" r="18"/><circle cx="315" cy="194" r="26"/><circle cx="435" cy="236" r="36"/>
    </g>
    <text x="112" y="112" font-size="10.5" fill="#EAE7DC">行列ができる</text>
    <text x="222" y="146" font-size="10.5" fill="#EAE7DC">通行人・SNSが注目</text>
    <text x="345" y="184" font-size="10.5" fill="#EAE7DC">迷う新規客が並ぶ</text>
    <text x="435" y="288" text-anchor="middle" font-size="11" fill="#E8A04C" font-family="var(--serif)">さらに大きく見える</text>
  </svg>`,

  // ep-2 ナッシュ均衡 — 浜辺の2つの売店が中央へ寄って膠着(ホテリング)
  "ep-2": `<svg viewBox="0 0 520 300" role="img" aria-label="浜辺に2つの売店が中央へ寄って並ぶ図">
    <defs>${AH}</defs>
    <g fill="#9BA0B4"><circle cx="40" cy="205" r="4"/><circle cx="88" cy="205" r="4"/><circle cx="136" cy="205" r="4"/><circle cx="184" cy="205" r="4"/><circle cx="232" cy="205" r="4"/><circle cx="260" cy="205" r="4"/><circle cx="288" cy="205" r="4"/><circle cx="336" cy="205" r="4"/><circle cx="384" cy="205" r="4"/><circle cx="432" cy="205" r="4"/><circle cx="480" cy="205" r="4"/></g>
    <rect x="24" y="220" width="472" height="12" rx="6" fill="#1F2438" stroke="rgba(234,231,220,.12)"/>
    <text x="260" y="252" text-anchor="middle" font-size="11" fill="#9BA0B4">海辺（客は一直線に等間隔でいる）</text>
    <line x1="260" y1="70" x2="260" y2="216" stroke="#C77F2E" stroke-width="1.4" stroke-dasharray="4 4" opacity=".8"/>
    <g opacity=".28"><rect x="120" y="150" width="34" height="30" rx="4" fill="#171B2C" stroke="#9BA0B4"/><path d="M116,150 h42 l-8,-12 h-26 z" fill="#9BA0B4"/><rect x="366" y="150" width="34" height="30" rx="4" fill="#171B2C" stroke="#9BA0B4"/><path d="M362,150 h42 l-8,-12 h-26 z" fill="#9BA0B4"/></g>
    <rect x="222" y="150" width="34" height="30" rx="4" fill="#1F2438" stroke="#E8A04C" stroke-width="1.5"/><path d="M218,150 h42 l-8,-13 h-26 z" fill="#E8A04C"/><text x="239" y="171" text-anchor="middle" font-size="14" font-family="var(--serif)" fill="#EAE7DC" font-weight="700">A</text>
    <rect x="264" y="150" width="34" height="30" rx="4" fill="#1F2438" stroke="#7DC98F" stroke-width="1.5"/><path d="M260,150 h42 l-8,-13 h-26 z" fill="#7DC98F"/><text x="281" y="171" text-anchor="middle" font-size="14" font-family="var(--serif)" fill="#EAE7DC" font-weight="700">B</text>
    <path d="M150,140 C 185,120 205,124 224,146" fill="none" stroke="#E8A04C" stroke-width="1.6" marker-end="url(#ah)"/>
    <path d="M370,140 C 335,120 315,124 296,146" fill="none" stroke="#E8A04C" stroke-width="1.6" marker-end="url(#ah)"/>
    <text x="260" y="104" text-anchor="middle" font-size="11.5" fill="#E8A04C">← 中央へ寄るほど、自分の取り分が増える →</text>
    <path d="M28,270 v-8 h224 v8" fill="none" stroke="#9BA0B4" stroke-width="1"/><path d="M268,270 v-8 h224 v8" fill="none" stroke="#9BA0B4" stroke-width="1"/>
    <text x="140" y="288" text-anchor="middle" font-size="11" fill="#E8A04C">Aが取る客</text><text x="380" y="288" text-anchor="middle" font-size="11" fill="#7DC98F">Bが取る客</text>
  </svg>`,

  // ep-3 ネットワーク効果 — 人が増えるほど「つながり」が爆発的に増える(メトカーフ)
  "ep-3": `<svg viewBox="0 0 520 300" role="img" aria-label="2人4人6人と増えるほど、つながりの線が急増する図">
    <defs>${AHm}</defs>
    <text x="260" y="26" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">価値は「つながる人数」に宿る</text>
    <!-- 2人=1本 -->
    <g stroke="#C77F2E" stroke-width="1.4"><line x1="70" y1="120" x2="110" y2="170"/></g>
    <g fill="#E8A04C"><circle cx="70" cy="120" r="6"/><circle cx="110" cy="170" r="6"/></g>
    <text x="90" y="210" text-anchor="middle" font-size="11" fill="#EAE7DC">2人</text>
    <text x="90" y="228" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--mono)">1本</text>
    <!-- 4人=6本 -->
    <g stroke="#C77F2E" stroke-width="1.2" opacity=".85"><line x1="215" y1="118" x2="275" y2="118"/><line x1="215" y1="172" x2="275" y2="172"/><line x1="215" y1="118" x2="215" y2="172"/><line x1="275" y1="118" x2="275" y2="172"/><line x1="215" y1="118" x2="275" y2="172"/><line x1="275" y1="118" x2="215" y2="172"/></g>
    <g fill="#E8A04C"><circle cx="215" cy="118" r="6"/><circle cx="275" cy="118" r="6"/><circle cx="215" cy="172" r="6"/><circle cx="275" cy="172" r="6"/></g>
    <text x="245" y="210" text-anchor="middle" font-size="11" fill="#EAE7DC">4人</text>
    <text x="245" y="228" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--mono)">6本</text>
    <!-- 6人=15本(六角) -->
    <g stroke="#C77F2E" stroke-width=".9" opacity=".7"><line x1="470" y1="145" x2="444" y2="190"/><line x1="470" y1="145" x2="392" y2="190"/><line x1="470" y1="145" x2="366" y2="145"/><line x1="470" y1="145" x2="392" y2="100"/><line x1="470" y1="145" x2="444" y2="100"/><line x1="444" y1="190" x2="392" y2="190"/><line x1="444" y1="190" x2="366" y2="145"/><line x1="444" y1="190" x2="392" y2="100"/><line x1="444" y1="190" x2="444" y2="100"/><line x1="392" y1="190" x2="366" y2="145"/><line x1="392" y1="190" x2="392" y2="100"/><line x1="392" y1="190" x2="444" y2="100"/><line x1="366" y1="145" x2="392" y2="100"/><line x1="366" y1="145" x2="444" y2="100"/><line x1="392" y1="100" x2="444" y2="100"/></g>
    <g fill="#E8A04C"><circle cx="470" cy="145" r="5.5"/><circle cx="444" cy="190" r="5.5"/><circle cx="392" cy="190" r="5.5"/><circle cx="366" cy="145" r="5.5"/><circle cx="392" cy="100" r="5.5"/><circle cx="444" cy="100" r="5.5"/></g>
    <text x="418" y="228" text-anchor="middle" font-size="11" fill="#EAE7DC">6人</text>
    <text x="418" y="246" text-anchor="middle" font-size="13" fill="#7DC98F" font-family="var(--mono)" font-weight="700">15本</text>
    <line x1="120" y1="150" x2="176" y2="150" stroke="#9BA0B4" stroke-width="1" marker-end="url(#ahm)" opacity=".7"/>
    <line x1="300" y1="150" x2="340" y2="150" stroke="#9BA0B4" stroke-width="1" marker-end="url(#ahm)" opacity=".7"/>
    <text x="260" y="284" text-anchor="middle" font-size="11" fill="#9BA0B4">人数が少し増えるだけで、価値(線の数)は跳ね上がる → 勝者総取り・ロックイン</text>
  </svg>`,

  // ep-4 創発(渋滞) — 車は右へ流れるのに、渋滞の塊は左(上流)へ後退する
  "ep-4": `<svg viewBox="0 0 520 300" role="img" aria-label="一本道で車は右へ進むが、渋滞の塊は左へ後退する図">
    <defs>${AH}${AHr}</defs>
    <line x1="60" y1="70" x2="300" y2="70" stroke="#E8A04C" stroke-width="1.4" marker-end="url(#ah)"/>
    <text x="150" y="60" font-size="11.5" fill="#E8A04C">車の流れ →</text>
    <rect x="24" y="120" width="472" height="70" rx="8" fill="#1F2438" stroke="rgba(234,231,220,.12)"/>
    <line x1="24" y1="155" x2="496" y2="155" stroke="#9BA0B4" stroke-width="1.2" stroke-dasharray="12 10" opacity=".4"/>
    <!-- 渋滞の塊(赤帯) -->
    <rect x="196" y="124" width="128" height="62" rx="6" fill="rgba(228,87,79,.16)" stroke="#E4574F" stroke-width="1"/>
    <!-- 車 -->
    <g fill="#9BA0B4"><rect x="46" y="132" width="18" height="10" rx="2"/><rect x="92" y="168" width="18" height="10" rx="2"/><rect x="140" y="132" width="18" height="10" rx="2"/></g>
    <g fill="#E4574F"><rect x="204" y="132" width="18" height="10" rx="2"/><rect x="226" y="168" width="18" height="10" rx="2"/><rect x="248" y="132" width="18" height="10" rx="2"/><rect x="270" y="168" width="18" height="10" rx="2"/><rect x="292" y="132" width="18" height="10" rx="2"/></g>
    <g fill="#9BA0B4"><rect x="360" y="168" width="18" height="10" rx="2"/><rect x="410" y="132" width="18" height="10" rx="2"/><rect x="458" y="168" width="18" height="10" rx="2"/></g>
    <line x1="320" y1="230" x2="200" y2="230" stroke="#E4574F" stroke-width="1.6" marker-end="url(#ahr)"/>
    <text x="330" y="234" font-size="11.5" fill="#E4574F">渋滞の塊 ←（上流へ後退）</text>
    <text x="260" y="270" text-anchor="middle" font-size="11" fill="#9BA0B4">先頭に原因はない。各自の「少し強めのブレーキ」が後ろへ増幅し、密度が閾値を超えると相転移する</text>
  </svg>`,

  // ep-5 資源の呪い — 断面図。地下の一点(油井)に皆が群がり、地上の稼ぐ力が枯れる
  "ep-5": `<svg viewBox="0 0 520 300" role="img" aria-label="地表の断面図。地下の油井に矢印が集中し、地上の畑や工場が枯れる図">
    <defs>${AH}${AHm}</defs>
    <rect x="24" y="150" width="472" height="126" fill="#14182a"/>
    <line x1="24" y1="150" x2="496" y2="150" stroke="#C77F2E" stroke-width="2"/>
    <text x="34" y="40" font-size="11" fill="#9BA0B4" font-family="var(--mono)">地上：稼ぐ力</text>
    <text x="34" y="172" font-size="11" fill="#9BA0B4" font-family="var(--mono)">地下：資源</text>
    <!-- 枯れる地上(しおれた植物・止まった工場) -->
    <g stroke="#E4574F" stroke-width="2" fill="none" opacity=".85"><path d="M92,150 C 92,120 96,110 78,104"/><path d="M78,104 q -10,-2 -14,6"/><path d="M92,128 q 12,-3 16,4"/></g>
    <text x="86" y="70" text-anchor="middle" font-size="10.5" fill="#E4574F">農業が枯れる</text>
    <g stroke="#9BA0B4" stroke-width="1.6" fill="none" opacity=".6"><rect x="398" y="112" width="46" height="38"/><line x1="398" y1="128" x2="444" y2="128"/></g>
    <text x="421" y="102" text-anchor="middle" font-size="10.5" fill="#9BA0B4">製造業が止まる</text>
    <!-- 地下の油(一点集中) -->
    <ellipse cx="260" cy="232" rx="58" ry="26" fill="#E8A04C" opacity=".9"/>
    <path d="M252,208 C 250,170 270,150 260,120 C 250,150 270,170 268,208 z" fill="#E8A04C"/>
    <text x="260" y="238" text-anchor="middle" font-size="11" fill="#14182a" font-weight="700">富の一点</text>
    <!-- 奪い合いの矢印 -->
    <line x1="120" y1="230" x2="196" y2="230" stroke="#9BA0B4" stroke-width="1.6" marker-end="url(#ahm)"/>
    <line x1="400" y1="230" x2="326" y2="230" stroke="#9BA0B4" stroke-width="1.6" marker-end="url(#ahm)"/>
    <text x="260" y="290" text-anchor="middle" font-size="11" fill="#E8A04C">働くより「一点の支配権」を奪い合う方が割に合う → 人材と権力が奪い合いへ</text>
  </svg>`,

  // ep-6 確証バイアス — 2×2マス。都合のいい2マスだけ記憶する
  "ep-6": `<svg viewBox="0 0 520 300" role="img" aria-label="担ぐ担がない×成功失敗の2×2表。記憶に残るのは対角の2マスだけ">
    <text x="330" y="52" text-anchor="middle" font-size="11" fill="#9BA0B4" font-family="var(--mono)">結果 →</text>
    <text x="250" y="70" text-anchor="middle" font-size="12" fill="#EAE7DC" font-weight="700">成功</text>
    <text x="410" y="70" text-anchor="middle" font-size="12" fill="#EAE7DC" font-weight="700">失敗</text>
    <text x="70" y="126" text-anchor="middle" font-size="11" fill="#9BA0B4" font-family="var(--mono)">担ぎ</text>
    <text x="70" y="140" text-anchor="middle" font-size="11" fill="#9BA0B4" font-family="var(--mono)">↓</text>
    <text x="108" y="130" text-anchor="middle" font-size="12" fill="#EAE7DC" font-weight="700">担いだ</text>
    <text x="108" y="220" text-anchor="middle" font-size="12" fill="#EAE7DC" font-weight="700">担がない</text>
    <!-- cells -->
    <rect x="170" y="82" width="160" height="82" rx="9" fill="rgba(125,201,143,.14)" stroke="#7DC98F" stroke-width="1.6"/>
    <text x="250" y="118" text-anchor="middle" font-size="13" fill="#EAE7DC" font-family="var(--serif)" font-weight="700">『効いた!』</text>
    <text x="250" y="140" text-anchor="middle" font-size="10.5" fill="#7DC98F">鮮明に記憶する</text>
    <rect x="336" y="82" width="160" height="82" rx="9" fill="#1F2438" stroke="rgba(234,231,220,.12)"/>
    <text x="416" y="118" text-anchor="middle" font-size="13" fill="#9BA0B4" font-family="var(--serif)">『今日は特別』</text>
    <text x="416" y="140" text-anchor="middle" font-size="10.5" fill="#9BA0B4">例外として忘れる</text>
    <rect x="170" y="172" width="160" height="82" rx="9" fill="#1F2438" stroke="rgba(234,231,220,.12)"/>
    <text x="250" y="208" text-anchor="middle" font-size="13" fill="#9BA0B4" font-family="var(--serif)">数えない</text>
    <text x="250" y="230" text-anchor="middle" font-size="10.5" fill="#9BA0B4">そもそも見ていない</text>
    <rect x="336" y="172" width="160" height="82" rx="9" fill="rgba(228,87,79,.14)" stroke="#E4574F" stroke-width="1.6"/>
    <text x="416" y="208" text-anchor="middle" font-size="13" fill="#EAE7DC" font-family="var(--serif)" font-weight="700">『だから言った』</text>
    <text x="416" y="230" text-anchor="middle" font-size="10.5" fill="#E4574F">強く刻む</text>
    <text x="260" y="284" text-anchor="middle" font-size="11" fill="#E8A04C">記憶に残るのは対角の2マスだけ → 4マス全部を数えないと効果は分からない</text>
  </svg>`,

  // ep-7 レモン市場 — 良品は「安すぎる」と市場から抜け、レモンだけ残る
  "ep-7": `<svg viewBox="0 0 520 300" role="img" aria-label="市場の箱から良品が上へ抜け、下にレモンだけ残る図">
    <defs>${AH}${AHr}</defs>
    <rect x="150" y="70" width="220" height="180" rx="12" fill="#1F2438" stroke="rgba(234,231,220,.14)"/>
    <text x="260" y="60" text-anchor="middle" font-size="12" fill="#EAE7DC" font-family="var(--serif)">市場</text>
    <!-- 良品が上へ抜ける -->
    <g fill="#7DC98F"><circle cx="205" cy="98" r="9"/><circle cx="250" cy="90" r="9"/></g>
    <line x1="205" y1="82" x2="205" y2="52" stroke="#7DC98F" stroke-width="1.6" marker-end="url(#ah)"/>
    <line x1="250" y1="74" x2="250" y2="48" stroke="#7DC98F" stroke-width="1.6" marker-end="url(#ah)"/>
    <text x="300" y="70" font-size="10.5" fill="#7DC98F">良品は「安すぎる」と撤退</text>
    <!-- 見えない霧 -->
    <rect x="150" y="150" width="220" height="26" fill="rgba(155,160,180,.16)"/>
    <text x="260" y="167" text-anchor="middle" font-size="10.5" fill="#C9C6BC" font-family="var(--mono)">買い手には品質が見えない</text>
    <!-- レモンだけ残る -->
    <g fill="#E8A04C"><ellipse cx="200" cy="212" rx="17" ry="11"/><ellipse cx="240" cy="224" rx="17" ry="11"/><ellipse cx="288" cy="210" rx="17" ry="11"/><ellipse cx="320" cy="226" rx="17" ry="11"/></g>
    <text x="260" y="246" text-anchor="middle" font-size="10.5" fill="#14182a" font-weight="700">レモン(悪品)だけ残る</text>
    <!-- 平均価格↓ -->
    <line x1="420" y1="120" x2="420" y2="220" stroke="#E4574F" stroke-width="1.8" marker-end="url(#ahr)"/>
    <text x="420" y="110" text-anchor="middle" font-size="11" fill="#E4574F">平均価格</text>
    <text x="440" y="175" font-size="11" fill="#E4574F">↓</text>
    <text x="260" y="286" text-anchor="middle" font-size="11" fill="#9BA0B4">誰も嘘をつかなくても、見分けられないというだけで良品が締め出される(逆選択)</text>
  </svg>`,

  // ep-8 二次効果 — 石を投げた波紋。近い波は「助かる」、遠い波が船を転覆させる
  "ep-8": `<svg viewBox="0 0 520 300" role="img" aria-label="水面に石を投げ、広がる波紋の遠くで船が転覆する図">
    <g fill="none" stroke="#E8A04C"><circle cx="120" cy="165" r="34" stroke-width="2.2" opacity=".9"/><circle cx="120" cy="165" r="72" stroke-width="1.8" opacity=".6"/><circle cx="120" cy="165" r="112" stroke-width="1.4" opacity=".4"/><circle cx="120" cy="165" r="150" stroke-width="1.1" opacity=".28"/></g>
    <circle cx="120" cy="165" r="7" fill="#EAE7DC"/>
    <text x="120" y="120" text-anchor="middle" font-size="11" fill="#EAE7DC" font-family="var(--serif)">善意の物資</text>
    <text x="120" y="230" text-anchor="middle" font-size="10.5" fill="#7DC98F">一次効果：今日、助かる</text>
    <!-- 遠くの船(転覆) -->
    <g transform="translate(392,150) rotate(24)"><path d="M-34,10 Q0,30 34,10 L26,20 Q0,30 -26,20 Z" fill="#E4574F" opacity=".9"/><line x1="0" y1="10" x2="0" y2="-26" stroke="#E4574F" stroke-width="2"/><path d="M0,-24 L20,-8 L0,-4 Z" fill="#E4574F"/></g>
    <text x="392" y="210" text-anchor="middle" font-size="10.5" fill="#E4574F">二次効果：地元の</text>
    <text x="392" y="226" text-anchor="middle" font-size="10.5" fill="#E4574F">生産者が廃業</text>
    <text x="260" y="282" text-anchor="middle" font-size="11" fill="#9BA0B4">「それで、次にどうなる?」を2回問う。逆転は二段目以降に潜む</text>
  </svg>`,

  // ep-9 モラルハザード — 天秤。安全を足すと行動が危険側へ増え、リスクの水準は一定に戻る
  "ep-9": `<svg viewBox="0 0 520 300" role="img" aria-label="天秤。安全装備を足すと大胆な行動が増え、全体は水平のまま釣り合う図">
    <line x1="90" y1="120" x2="430" y2="120" stroke="#C9C6BC" stroke-width="1.4" stroke-dasharray="6 5" opacity=".7"/>
    <text x="440" y="116" font-size="10" fill="#C9C6BC" text-anchor="start">リスクの</text>
    <text x="440" y="130" font-size="10" fill="#C9C6BC" text-anchor="start">水準(一定)</text>
    <!-- 支柱・梁 -->
    <rect x="256" y="118" width="8" height="120" fill="#9BA0B4"/>
    <path d="M240,238 L280,238 L296,262 L224,262 Z" fill="#1F2438" stroke="#9BA0B4"/>
    <rect x="120" y="114" width="280" height="7" rx="3.5" fill="#E8A04C"/>
    <circle cx="260" cy="117" r="6" fill="#EAE7DC"/>
    <!-- 左皿：安全装備 -->
    <line x1="140" y1="118" x2="140" y2="150" stroke="#9BA0B4"/><path d="M110,150 a30,14 0 0 0 60,0" fill="none" stroke="#7DC98F" stroke-width="2"/>
    <text x="140" y="180" text-anchor="middle" font-size="11" fill="#7DC98F">安全装備 ＋</text>
    <text x="140" y="196" text-anchor="middle" font-size="10" fill="#9BA0B4">(ブレーキ・保険)</text>
    <!-- 右皿：大胆な行動 -->
    <line x1="380" y1="118" x2="380" y2="150" stroke="#9BA0B4"/><path d="M350,150 a30,14 0 0 0 60,0" fill="none" stroke="#E4574F" stroke-width="2"/>
    <text x="380" y="180" text-anchor="middle" font-size="11" fill="#E4574F">大胆な行動 ＋</text>
    <text x="380" y="196" text-anchor="middle" font-size="10" fill="#9BA0B4">(車間を詰める)</text>
    <text x="260" y="286" text-anchor="middle" font-size="11" fill="#E8A04C">片方(安全)を足すと、もう片方(油断)が増えて釣り合う → 全体のリスクは元へ戻る</text>
  </svg>`,

  // ep-10 創造的破壊 — 性能×時間。既存と新技術のS字が交差し、下から追い越す
  "ep-10": `<svg viewBox="0 0 520 300" role="img" aria-label="性能の時間変化。既存技術と新技術のS字カーブが交差する図">
    <defs>${AHm}</defs>
    <line x1="56" y1="40" x2="56" y2="250" stroke="#9BA0B4" stroke-width="1" marker-end="url(#ahm)" opacity=".7"/>
    <line x1="56" y1="250" x2="500" y2="250" stroke="#9BA0B4" stroke-width="1" marker-end="url(#ahm)" opacity=".7"/>
    <text x="46" y="36" text-anchor="end" font-size="11" fill="#9BA0B4">性能</text>
    <text x="500" y="268" text-anchor="end" font-size="11" fill="#9BA0B4">時間 →</text>
    <line x1="56" y1="150" x2="500" y2="150" stroke="#C9C6BC" stroke-width="1.2" stroke-dasharray="5 4" opacity=".55"/>
    <text x="500" y="144" text-anchor="end" font-size="10.5" fill="#C9C6BC">顧客が必要とする水準</text>
    <path d="M56,150 C 150,150 175,95 250,88 S 430,82 500,80" fill="none" stroke="#E8A04C" stroke-width="2.6"/>
    <text x="360" y="72" font-size="11" fill="#E8A04C">既存の王者（過剰性能・高コスト）</text>
    <path d="M56,242 C 200,240 250,215 300,150 S 420,58 500,44" fill="none" stroke="#7DC98F" stroke-width="2.6"/>
    <text x="70" y="232" font-size="11" fill="#7DC98F">破壊的な新技術（安い・小さい・手軽）</text>
    <circle cx="300" cy="150" r="6" fill="#0F1220" stroke="#E4574F" stroke-width="2.2"/>
    <line x1="300" y1="150" x2="300" y2="250" stroke="#E4574F" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>
    <text x="300" y="180" text-anchor="middle" font-size="11" fill="#E4574F" font-family="var(--serif)" font-weight="700">ここで弱点が</text>
    <text x="300" y="196" text-anchor="middle" font-size="11" fill="#E4574F" font-family="var(--serif)" font-weight="700">強みに変わる</text>
  </svg>`,

  // ep-11 シグナリング — 「コストの壁」を、高い質は軽々越え、低い質は割に合わず引き返す(分離)
  "ep-11": `<svg viewBox="0 0 520 300" role="img" aria-label="コストの壁を、高い質は飛び越え、低い質は割に合わず引き返す図">
    <defs>${AHr}<marker id="ahg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7DC98F"/></marker></defs>
    <text x="260" y="24" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">シグナルは、本物と偽物を「ふるい分ける」</text>
    <line x1="40" y1="212" x2="480" y2="212" stroke="#9BA0B4" stroke-width="1" opacity=".25"/>
    <!-- コストの壁(縦長オブジェクト＝縦書きラベル) -->
    <rect x="244" y="70" width="34" height="142" rx="4" fill="#E8A04C"/>
    <text x="261" y="98" text-anchor="middle" font-size="12" fill="#14182a" font-weight="700"><tspan x="261" dy="0">コ</tspan><tspan x="261" dy="15">ス</tspan><tspan x="261" dy="15">ト</tspan><tspan x="261" dy="15">の</tspan><tspan x="261" dy="15">壁</tspan></text>
    <!-- 高い質：軽々と越える -->
    <path d="M90,186 C 150,110 215,58 261,58 C 310,58 362,110 388,160" fill="none" stroke="#7DC98F" stroke-width="2.4" marker-end="url(#ahg)"/>
    <circle cx="90" cy="186" r="7" fill="#7DC98F"/>
    <text x="88" y="205" text-anchor="middle" font-size="11" fill="#7DC98F">高い質</text>
    <text x="150" y="70" text-anchor="middle" font-size="10.5" fill="#7DC98F">コストが軽い＝越えられる</text>
    <!-- 低い質：割に合わず引き返す -->
    <path d="M150,190 L236,190 C 254,190 254,206 236,206 L184,206" fill="none" stroke="#E4574F" stroke-width="2" marker-end="url(#ahr)"/>
    <circle cx="150" cy="190" r="6" fill="#E4574F"/>
    <text x="150" y="234" text-anchor="start" font-size="10.5" fill="#E4574F">低い質＝割に合わず引き返す</text>
    <!-- 受け手：本物と判定 -->
    <g stroke="#7DC98F" stroke-width="1.8" fill="none"><circle cx="410" cy="132" r="13"/><path d="M403,132 l5,6 l10,-12"/></g>
    <text x="410" y="166" text-anchor="middle" font-size="10.5" fill="#7DC98F">受け手：本物と判定</text>
    <text x="260" y="286" text-anchor="middle" font-size="11" fill="#9BA0B4">質が高い者ほどコストが軽い。だから「越えられた」という事実だけで、本物だと伝わる</text>
  </svg>`,

  // ep-12 比較優位 — 同じ資源でも「特化＋交換」で総生産(山の高さ)が増える
  "ep-12": `<svg viewBox="0 0 520 300" role="img" aria-label="各自で全部作る場合より、得意に特化して交換した方が、総生産の山が高くなる図">
    <defs>${AH}</defs>
    <text x="260" y="22" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">同じ資源でも、「得意に絞って交換」で総量が増える</text>
    <rect x="300" y="34" width="12" height="9" fill="#E8A04C"/><text x="318" y="42" font-size="10" fill="#9BA0B4">パン</text>
    <rect x="366" y="34" width="12" height="9" fill="#7DC98F"/><text x="384" y="42" font-size="10" fill="#9BA0B4">魚</text>
    <line x1="40" y1="210" x2="480" y2="210" stroke="#9BA0B4" stroke-width="1.2" opacity=".45"/>
    <!-- ① 各自で全部作る（総量=8） -->
    <g>
      <rect x="116" y="200" width="40" height="10" fill="#E8A04C"/><rect x="116" y="188" width="40" height="10" fill="#7DC98F"/><rect x="116" y="176" width="40" height="10" fill="#E8A04C"/><rect x="116" y="164" width="40" height="10" fill="#7DC98F"/><rect x="116" y="152" width="40" height="10" fill="#E8A04C"/><rect x="116" y="140" width="40" height="10" fill="#7DC98F"/><rect x="116" y="128" width="40" height="10" fill="#E8A04C"/><rect x="116" y="116" width="40" height="10" fill="#7DC98F"/>
    </g>
    <text x="136" y="228" text-anchor="middle" font-size="11" fill="#EAE7DC">① 各自で全部作る</text>
    <text x="136" y="244" text-anchor="middle" font-size="10" fill="#9BA0B4">(半々に手を出す)</text>
    <!-- ② 特化して交換（総量=12） -->
    <g>
      <rect x="352" y="200" width="40" height="10" fill="#E8A04C"/><rect x="352" y="188" width="40" height="10" fill="#7DC98F"/><rect x="352" y="176" width="40" height="10" fill="#E8A04C"/><rect x="352" y="164" width="40" height="10" fill="#7DC98F"/><rect x="352" y="152" width="40" height="10" fill="#E8A04C"/><rect x="352" y="140" width="40" height="10" fill="#7DC98F"/><rect x="352" y="128" width="40" height="10" fill="#E8A04C"/><rect x="352" y="116" width="40" height="10" fill="#7DC98F"/><rect x="352" y="104" width="40" height="10" fill="#E8A04C"/><rect x="352" y="92" width="40" height="10" fill="#7DC98F"/><rect x="352" y="80" width="40" height="10" fill="#E8A04C"/><rect x="352" y="68" width="40" height="10" fill="#7DC98F"/>
    </g>
    <text x="372" y="228" text-anchor="middle" font-size="11" fill="#EAE7DC">② 得意に特化＋交換</text>
    <text x="372" y="244" text-anchor="middle" font-size="10" fill="#9BA0B4">A=パン / B=魚 ⇄</text>
    <!-- 総量が増える矢印 -->
    <path d="M162,120 C 240,86 300,80 344,74" fill="none" stroke="#E8A04C" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#ah)"/>
    <text x="256" y="66" text-anchor="middle" font-size="11" fill="#E8A04C">総量が増える</text>
    <text x="260" y="284" text-anchor="middle" font-size="11" fill="#9BA0B4">決め手は「速さ」でなく「何を諦めるか」＝機会費用。得意に絞るほど無駄が消える</text>
  </svg>`,

  // ep-13 コモンズの悲劇 — 共有の海。各自が魚を引き出す(得はまるごと)、資源は静かに縮む(損はみんなに薄く)
  "ep-13": `<svg viewBox="0 0 520 300" role="img" aria-label="共有の海から各漁師が魚を引き出し、資源が元の水準から縮んでいく図">
    <defs>${AH}</defs>
    <text x="260" y="22" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">得は独り占め、損はみんなで薄く分ける</text>
    <text x="250" y="92" text-anchor="middle" font-size="10" fill="#E4574F">─ もとの資源量 ─</text>
    <ellipse cx="250" cy="165" rx="118" ry="66" fill="none" stroke="#E4574F" stroke-width="1.3" stroke-dasharray="6 5" opacity=".8"/>
    <ellipse cx="250" cy="172" rx="78" ry="42" fill="rgba(125,201,143,.18)" stroke="#7DC98F" stroke-width="1.6"/>
    <text x="250" y="150" text-anchor="middle" font-size="11" fill="#EAE7DC" font-family="var(--serif)">みんなの海</text>
    <g fill="#7DC98F"><ellipse cx="214" cy="178" rx="10" ry="5"/><path d="M224,178 l8,-4 v8 z"/><ellipse cx="262" cy="188" rx="10" ry="5"/><path d="M272,188 l8,-4 v8 z"/><ellipse cx="292" cy="172" rx="9" ry="4.5"/><path d="M301,172 l7,-4 v8 z"/></g>
    <text x="250" y="224" text-anchor="middle" font-size="10" fill="#E4574F">資源は静かに減る（損はみんなに薄く）</text>
    <!-- 4人の漁師と「引き出す」矢印(得はまるごと自分) -->
    <g fill="#E8A04C"><circle cx="52" cy="96" r="6"/><circle cx="448" cy="96" r="6"/><circle cx="52" cy="244" r="6"/><circle cx="448" cy="244" r="6"/></g>
    <text x="52" y="82" text-anchor="middle" font-size="10" fill="#9BA0B4">漁師</text>
    <text x="448" y="82" text-anchor="middle" font-size="10" fill="#9BA0B4">漁師</text>
    <text x="52" y="264" text-anchor="middle" font-size="10" fill="#9BA0B4">漁師</text>
    <text x="448" y="264" text-anchor="middle" font-size="10" fill="#9BA0B4">漁師</text>
    <g stroke="#E8A04C" stroke-width="1.7" fill="none">
      <path d="M186,148 C 140,120 100,110 66,102" marker-end="url(#ah)"/>
      <path d="M314,148 C 360,120 400,110 434,102" marker-end="url(#ah)"/>
      <path d="M186,196 C 140,224 100,234 66,238" marker-end="url(#ah)"/>
      <path d="M314,196 C 360,224 400,234 434,238" marker-end="url(#ah)"/>
    </g>
    <text x="128" y="116" text-anchor="middle" font-size="10" fill="#E8A04C">得＝まるごと自分</text>
    <text x="260" y="286" text-anchor="middle" font-size="11" fill="#9BA0B4">一人ひとりは合理的なのに、全員で自分の首を絞める。持ち主がいない資源は守られない</text>
  </svg>`,

  // ep-14 選好の偽装 — 水面の上は全員「賛成」、下の本音は割れている。たまった本音が水面を押し上げる
  "ep-14": `<svg viewBox="0 0 520 300" role="img" aria-label="水面の上では全員が賛成に見えるが、水面下の本音は反対が多く、押し上げて噴き出そうとする図">
    <defs>${AHr}</defs>
    <text x="260" y="20" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">表は全員「賛成」、裏の本音は割れている</text>
    <text x="250" y="42" text-anchor="middle" font-size="10.5" fill="#E8A04C">見える世論（表向き）</text>
    <g fill="#9BA0B4"><circle cx="80" cy="60" r="7"/><circle cx="165" cy="60" r="7"/><circle cx="250" cy="60" r="7"/><circle cx="335" cy="60" r="7"/><circle cx="420" cy="60" r="7"/></g>
    <g fill="#E8A04C"><rect x="56" y="72" width="48" height="20" rx="10"/><rect x="141" y="72" width="48" height="20" rx="10"/><rect x="226" y="72" width="48" height="20" rx="10"/><rect x="311" y="72" width="48" height="20" rx="10"/><rect x="396" y="72" width="48" height="20" rx="10"/></g>
    <g fill="#14182a" font-size="11" text-anchor="middle" font-weight="700"><text x="80" y="86">賛成</text><text x="165" y="86">賛成</text><text x="250" y="86">賛成</text><text x="335" y="86">賛成</text><text x="420" y="86">賛成</text></g>
    <line x1="24" y1="140" x2="496" y2="140" stroke="#9BA0B4" stroke-width="1.4" stroke-dasharray="8 5" opacity=".7"/>
    <text x="492" y="135" text-anchor="end" font-size="9" fill="#9BA0B4">水面</text>
    <g stroke="#E4574F" stroke-width="1.8"><line x1="80" y1="166" x2="80" y2="145" marker-end="url(#ahr)"/><line x1="165" y1="166" x2="165" y2="145" marker-end="url(#ahr)"/><line x1="335" y1="166" x2="335" y2="145" marker-end="url(#ahr)"/></g>
    <g><circle cx="80" cy="182" r="14" fill="#E4574F"/><circle cx="165" cy="182" r="14" fill="#E4574F"/><circle cx="250" cy="182" r="14" fill="#7DC98F"/><circle cx="335" cy="182" r="14" fill="#E4574F"/><circle cx="420" cy="182" r="14" fill="#7DC98F"/></g>
    <g fill="#14182a" font-size="14" text-anchor="middle" font-weight="700"><text x="80" y="187">×</text><text x="165" y="187">×</text><text x="250" y="187">○</text><text x="335" y="187">×</text><text x="420" y="187">○</text></g>
    <text x="250" y="228" text-anchor="middle" font-size="10.5" fill="#E4574F">たまった本音（×＝反対）が、水面を押し上げる</text>
    <text x="250" y="262" text-anchor="middle" font-size="10.5" fill="#E8A04C">隠れた本音（心の中）</text>
    <text x="260" y="286" text-anchor="middle" font-size="11" fill="#9BA0B4">全員一致に見えても中身は空洞かも。閾値を越えると、隠れた本音が一斉に噴き出す</text>
  </svg>`,

  // ep-15 経路依存性 — 地形の谷。今の標準は「高い谷」に閉じ込められ、より良い「低い谷」へは壁で移れない(ロックイン)
  "ep-15": `<svg viewBox="0 0 520 300" role="img" aria-label="二つの谷の地形。ボールは高い方の谷に閉じ込められ、より低い(良い)谷へは尾根の壁で移れない図">
    <defs>${AH}${AHr}</defs>
    <text x="260" y="22" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">今いる谷が「最適」とは限らない</text>
    <path d="M24,130 C 78,130 115,196 150,196 C 200,196 224,110 262,110 C 302,110 342,238 378,238 C 420,238 462,192 496,184 L496,285 L24,285 Z" fill="rgba(155,160,180,.10)" stroke="#9BA0B4" stroke-width="1.6"/>
    <line x1="150" y1="196" x2="470" y2="196" stroke="#C9C6BC" stroke-width="1" stroke-dasharray="4 4" opacity=".4"/>
    <text x="60" y="84" text-anchor="middle" font-size="10" fill="#E8A04C">初期の偶然</text>
    <path d="M58,92 C 70,108 90,116 108,124" fill="none" stroke="#E8A04C" stroke-width="1.6" marker-end="url(#ah)"/>
    <circle cx="150" cy="185" r="11" fill="#E8A04C"/>
    <text x="150" y="168" text-anchor="middle" font-size="10" fill="#EAE7DC">今の標準</text>
    <text x="262" y="96" text-anchor="middle" font-size="10.5" fill="#E4574F">切り替えの壁</text>
    <path d="M168,176 C 205,150 232,132 250,122" fill="none" stroke="#E4574F" stroke-width="1.7" stroke-dasharray="5 4" marker-end="url(#ahr)"/>
    <text x="278" y="118" font-size="13" fill="#E4574F" font-weight="700">×</text>
    <circle cx="378" cy="227" r="11" fill="none" stroke="#7DC98F" stroke-width="1.8" stroke-dasharray="4 3"/>
    <text x="378" y="262" text-anchor="middle" font-size="10" fill="#7DC98F">より良い道（普及せず）</text>
    <text x="452" y="188" text-anchor="middle" font-size="9" fill="#C9C6BC">低い＝良い</text>
    <text x="260" y="284" text-anchor="middle" font-size="11" fill="#9BA0B4">初期の偶然が溝を深める。より良い道が見えても壁を越えられない＝ロックイン</text>
  </svg>`,

  // ep-16 生存者バイアス — 帰還した爆撃機。弾痕は「撃たれても飛べた場所」、穴の無いエンジン/操縦席こそ致命部位
  "ep-16": `<svg viewBox="0 0 520 300" role="img" aria-label="帰還した爆撃機の上面図。弾痕は翼と胴体後方に集中し、穴の無いエンジンと操縦席を補強すべきと示す図">
    <defs>${AH}${AHr}</defs>
    <text x="260" y="20" text-anchor="middle" font-size="12" fill="#E8A04C" font-family="var(--serif)">帰還機の「弾痕」が語るのは、生存者だけ</text>
    <!-- 機体(上面図) -->
    <ellipse cx="260" cy="150" rx="145" ry="16" fill="#2A3048" stroke="#9BA0B4" stroke-width="1.3"/>
    <ellipse cx="260" cy="232" rx="52" ry="11" fill="#2A3048" stroke="#9BA0B4" stroke-width="1.3"/>
    <path d="M242,90 Q260,58 278,90 L272,250 Q260,262 248,250 Z" fill="#2A3048" stroke="#9BA0B4" stroke-width="1.3"/>
    <!-- 弾痕(帰還機に集中＝撃たれても飛べた場所) -->
    <g fill="#E4574F"><circle cx="150" cy="150" r="4"/><circle cx="178" cy="144" r="4"/><circle cx="126" cy="152" r="4"/><circle cx="345" cy="150" r="4"/><circle cx="372" cy="145" r="4"/><circle cx="398" cy="150" r="4"/><circle cx="260" cy="196" r="4"/><circle cx="252" cy="216" r="4"/><circle cx="268" cy="214" r="4"/><circle cx="236" cy="232" r="4"/><circle cx="285" cy="232" r="4"/></g>
    <!-- 穴が無い＝致命部位(エンジン・操縦席) -->
    <g fill="none" stroke="#E8A04C" stroke-width="1.8" stroke-dasharray="4 3"><circle cx="190" cy="150" r="13"/><circle cx="330" cy="150" r="13"/><circle cx="260" cy="98" r="15"/></g>
    <text x="66" y="46" text-anchor="start" font-size="10.5" fill="#E4574F">● 弾痕（帰還機に集中）</text>
    <path d="M96,52 C 120,90 135,120 150,142" fill="none" stroke="#E4574F" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#ahr)"/>
    <text x="454" y="46" text-anchor="end" font-size="10.5" fill="#E8A04C">○ 穴が無い＝致命部位</text>
    <text x="454" y="60" text-anchor="end" font-size="10.5" fill="#E8A04C">→ ここを補強せよ</text>
    <path d="M418,66 C 390,96 360,120 344,140" fill="none" stroke="#E8A04C" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#ah)"/>
    <text x="260" y="284" text-anchor="middle" font-size="11" fill="#9BA0B4">見えるのは「帰ってきた機」だけ。データに“無い”ものこそ、一番大事な情報</text>
  </svg>`,
};
