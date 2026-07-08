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
};
