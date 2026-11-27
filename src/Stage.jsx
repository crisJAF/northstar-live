import React from "react";

function Santa() {
  return (
    <g className="actor santa">
      <ellipse className="shadow" cx="150" cy="263" rx="72" ry="10" />
      <g className="body-bob">
        <path d="M102 222v33h34v-30m30 0v30h35v-33" fill="#211a38" />
        <path d="M99 163Q75 210 95 241H207Q224 199 196 163Z" fill="#ff6b70" />
        <path d="M150 164v75" stroke="#f7f2ff" strokeWidth="17" />
        <path d="M91 217h117" stroke="#382b50" strokeWidth="14" />
        <rect x="139" y="208" width="25" height="20" rx="3" fill="#ffd166" />
        <rect x="146" y="213" width="11" height="10" fill="#382b50" />
        <g className="wave-arm">
          <path
            d="M192 176q42 10 40-30"
            fill="none"
            stroke="#ff6b70"
            strokeWidth="25"
            strokeLinecap="round"
          />
          <circle cx="232" cy="140" r="13" fill="#f7f2ff" />
        </g>
        <path
          d="M105 181q-29 22-15 43"
          fill="none"
          stroke="#ff6b70"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <g className="head">
          <ellipse cx="151" cy="133" rx="56" ry="59" fill="#f7f2ff" />
          <ellipse cx="151" cy="115" rx="43" ry="37" fill="#edb595" />
          <path
            d="M106 107q-8-69 44-65 54-4 57 48l-24-12-11-15-5 30"
            fill="#ff6b70"
          />
          <circle cx="205" cy="89" r="14" fill="#f7f2ff" />
          <rect x="100" y="82" width="89" height="20" rx="10" fill="#f7f2ff" />
          <g className="eyes">
            <ellipse cx="135" cy="116" rx="4" ry="6" fill="#211a38" />
            <ellipse cx="167" cy="116" rx="4" ry="6" fill="#211a38" />
          </g>
          <path
            d="M125 104l16-3m20 0 15 3"
            stroke="#f7f2ff"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse cx="151" cy="129" rx="10" ry="8" fill="#e79180" />
          <path
            d="M150 137q-20-14-29 4 18 10 29 0 14 11 30 0-9-17-30-4"
            fill="#f7f2ff"
          />
          <path
            className="mouth"
            d="M140 154q11 11 22 0"
            fill="none"
            stroke="#9b4556"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            className="sweat"
            d="M196 109q-13 19 0 19 13 0 0-19"
            fill="#80cfed"
          />
        </g>
      </g>
    </g>
  );
}
function Elf({ kevin = false }) {
  return (
    <g className={"actor elf " + (kevin ? "kevin" : "yelba")}>
      <ellipse className="shadow" cx="150" cy="265" rx="65" ry="9" />
      <g className="body-bob">
        <path d="M125 211v40m49-40v40" stroke="#f7f2ff" strokeWidth="17" />
        <path
          d="M116 256q-27 14-24-4m73 4q30 14 30-4"
          stroke="#ff6b70"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M117 151q-20 36-15 69h96q5-37-17-69"
          fill={kevin ? "#b5a0ef" : "#65d6b0"}
        />
        <path d="M123 155l27 20 27-20" fill="#f7f2ff" />
        <path d="M104 201h91" stroke="#382b50" strokeWidth="10" />
        <rect x="140" y="195" width="20" height="14" rx="2" fill="#ffd166" />
        <path
          d="M114 170q-30 25-22 45"
          stroke={kevin ? "#b5a0ef" : "#65d6b0"}
          strokeWidth="19"
          fill="none"
          strokeLinecap="round"
        />
        <g className="wave-arm">
          <path
            d="M185 168q30 20 27 50"
            stroke={kevin ? "#b5a0ef" : "#65d6b0"}
            strokeWidth="19"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="211" cy="220" r="10" fill="#edb595" />
        </g>
        <g className="head">
          <path
            d="M111 104L78 87l15 41 27 5m61-30 34-16-15 42-22 4"
            fill="#edb595"
          />
          <ellipse cx="150" cy="115" rx="47" ry="44" fill="#edb595" />
          <path
            d="M101 97q6-51 57-70l15 27 36 10-30 30"
            fill={kevin ? "#b5a0ef" : "#65d6b0"}
          />
          <circle cx="205" cy="65" r="10" fill="#ffd166" />
          <path
            d="M105 91q45-16 84 1"
            stroke="#f7f2ff"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <g className="eyes">
            <circle cx="133" cy="116" r="4" fill="#211a38" />
            <circle cx="168" cy="116" r="4" fill="#211a38" />
          </g>
          {kevin && (
            <g fill="none" stroke="#382b50" strokeWidth="3">
              <circle cx="133" cy="117" r="13" />
              <circle cx="168" cy="117" r="13" />
              <path d="M146 117h9" />
            </g>
          )}
          <path
            d="M141 140q10 7 20-1"
            stroke="#9b4556"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        {!kevin && (
          <g className="clipboard">
            <rect x="78" y="183" width="48" height="57" rx="5" fill="#ffd166" />
            <path
              d="M86 198h31m-31 10h31m-31 10h20"
              stroke="#62435e"
              strokeWidth="3"
            />
          </g>
        )}
        {kevin && (
          <g className="ribbon" fill="none" stroke="#ffd166" strokeWidth="10">
            <path d="M109 164l79 57m-82-34h87" />
          </g>
        )}
      </g>
    </g>
  );
}
function Reindeer() {
  return (
    <g className="actor reindeer">
      <ellipse className="shadow" cx="150" cy="264" rx="80" ry="10" />
      <g className="body-bob">
        <path
          d="M108 211v43m32-43v43m41-43v43m25-43v43"
          stroke="#9f6b53"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M107 254h10m20 0h10m28 0h11m15 0h11"
          stroke="#382b50"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <ellipse cx="157" cy="199" rx="65" ry="38" fill="#b78260" />
        <path
          d="M211 185q34-25 27-1"
          stroke="#b78260"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
        <g className="head">
          <path
            d="M112 92l-15-41m5 20-24-9m23 0 8-24m43 54 16-42m-10 20 25-10m-20 1-6-24"
            fill="none"
            stroke="#e4b98c"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M108 107Q66 77 66 108l37 22m50-22q43-33 43 0l-36 23"
            fill="#b78260"
          />
          <ellipse cx="132" cy="131" rx="43" ry="54" fill="#b78260" />
          <ellipse cx="132" cy="156" rx="36" ry="25" fill="#e4b98c" />
          <g className="eyes">
            <ellipse cx="116" cy="122" rx="4" ry="6" fill="#211a38" />
            <ellipse cx="148" cy="122" rx="4" ry="6" fill="#211a38" />
          </g>
          <circle className="nose" cx="133" cy="145" r="13" fill="#ff6b70" />
          <path
            d="M124 170q8 6 16 0"
            stroke="#382b50"
            strokeWidth="3"
            fill="none"
          />
          <path d="M102 184q29 13 60-1" stroke="#65d6b0" strokeWidth="12" />
          <circle cx="134" cy="193" r="8" fill="#ffd166" />
        </g>
      </g>
    </g>
  );
}
export default function Stage({
  character = "santa",
  setting = "office",
  mood = "idle",
  dialogue = "",
  compact = false,
  revision = 0,
  final = false,
}) {
  const name = {
    santa: "Santa · administrador sin supervisión",
    reindeer: "Rodolfo · piloto en modo ahorro",
    yelba: "Yelba · jefa del taller",
    kevin: "Kevin · pasante con respaldo",
  }[character];
  return (
    <div
      className={
        "stage " +
        setting +
        " " +
        mood +
        (compact ? " compact" : "") +
        (final ? " finale" : "")
      }
    >
      <div className="stage-stars" aria-hidden="true">
        ✦ · ˚　　　✧　　　·　✦
      </div>
      <div className="stage-snow" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i
            key={i}
            style={{
              left: i * 8 + 3 + "%",
              animationDelay: i * 0.47 + "s",
              animationDuration: 5 + (i % 4) + "s",
            }}
          />
        ))}
      </div>
      <svg
        className="landscape"
        viewBox="0 0 700 300"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <circle cx="575" cy="65" r="31" fill="#ffd166" />
        <path d="M0 227Q120 190 255 236T700 208V300H0" fill="#8070a0" />
        <path d="M0 265Q210 213 410 257T700 245V300H0" fill="#f7f2ff" />
        {setting === "workshop" ? (
          <g>
            <path d="M33 202v-94h155v94" fill="#554169" />
            <path d="M21 108l90-54 90 54" fill="#ff6b70" />
            <path
              d="M64 130h28v35H64m35-35h28v35H99m35-35h28v35h-28"
              fill="#ffd166"
            />
            <rect
              x="495"
              y="195"
              width="165"
              height="24"
              rx="12"
              fill="#382b50"
            />
            <g className="gift-belt">
              <rect
                x="513"
                y="161"
                width="34"
                height="34"
                rx="4"
                fill="#ff6b70"
              />
              <path d="M530 161v34" stroke="#ffd166" strokeWidth="5" />
              <rect
                x="571"
                y="152"
                width="43"
                height="43"
                rx="4"
                fill="#65d6b0"
              />
              <path d="M591 152v43" stroke="#f7f2ff" strokeWidth="6" />
            </g>
          </g>
        ) : (
          <g fill="#514569">
            <path d="M70 105l-52 101h104zm0 39L4 234h132zM600 122l-50 95h100zm0 43-65 80h130z" />
          </g>
        )}
        {setting === "office" && (
          <g>
            <rect
              x="490"
              y="166"
              width="105"
              height="62"
              rx="7"
              fill="#382b50"
            />
            <rect
              x="500"
              y="176"
              width="85"
              height="40"
              rx="3"
              fill="#65d6b0"
            />
            <path
              d="M516 190l12 7-12 7m23 0h22"
              stroke="#211a38"
              strokeWidth="3"
              fill="none"
            />
            <path d="M476 231h137" stroke="#c49b75" strokeWidth="10" />
          </g>
        )}
        {setting === "hangar" && (
          <g className="sleigh">
            <path d="M493 204q50 15 102-20v41h-85z" fill="#ff6b70" />
            <path
              d="M500 235h115q20-3 16-18"
              stroke="#ffd166"
              strokeWidth="6"
              fill="none"
            />
            <rect x="525" y="173" width="32" height="30" fill="#65d6b0" />
          </g>
        )}
      </svg>
      <svg
        key={character + "-" + revision}
        className="character"
        viewBox="0 0 300 290"
        role="img"
        aria-label={name}
      >
        {character === "santa" ? (
          <Santa />
        ) : character === "reindeer" ? (
          <Reindeer />
        ) : (
          <Elf kevin={character === "kevin"} />
        )}
      </svg>
      {final && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => (
            <i
              key={i}
              style={{
                left: i * 5 + "%",
                animationDelay: i * 0.17 + "s",
                background: ["#ffd166", "#ff6b70", "#65d6b0"][i % 3],
              }}
            />
          ))}
        </div>
      )}
      {dialogue && (
        <div className="speech">
          <strong>{name.split(" · ")[0]}</strong>
          <span>{dialogue}</span>
        </div>
      )}
    </div>
  );
}
