const tableBody = document.getElementById("tableBody");
const tabButtons = document.querySelectorAll(".tabBtn");
const tableHeadRow = document.getElementById("headerRow");

let currentSort = null;
let sortDirection = 1;
let currentJson = "0a.json";

function getYoutubeId(url) {    // YouTube ID取得
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/); 
  return match ? match[1] : null;
}

function loadTable(jsonFile) {    // JSON読み込み
  fetch(jsonFile)
    .then(response => response.json())
    .then(data => {

      tableBody.innerHTML = "";
      const songs = data.songs;

      //  最大公演回数を取得
      let maxCount = 0;
      songs.forEach(song => {
        if (song.performances.length > maxCount) {
          maxCount = song.performances.length;
        }
      });

      //  既存の履歴ヘッダーを削除
      const existingHistory = tableHeadRow.querySelectorAll(".history-header");
      existingHistory.forEach(th => th.remove());

      //  履歴ヘッダー追加
      for (let i = 1; i < maxCount; i++) {
      const th = document.createElement("th");
       th.textContent = "";
       th.classList.add("history-col");
       th.classList.add("history-header");
       tableHeadRow.appendChild(th);
      }

      if (currentSort === "title") {
       songs.sort((a, b) => {
        return a.sortKey.localeCompare(b.sortKey, "ja") * sortDirection;
       });
      }

      if (currentSort === "date") {
       songs.sort((a, b) => {
         const getLatest = (song) => {
            if (!song.performances || song.performances.length === 0) return 0;
            return Math.max(
              ...song.performances.map(p => new Date(p.date).getTime())
            );
          };
            return (getLatest(a) - getLatest(b)) * sortDirection;
       });
      }

      songs.forEach(song => {

        //  空データはスキップ
        if (
        !song.title.trim() ||
        !song.performances.length ||
        song.performances[0].date === "--"
        ) {
        return;
        }

        const tr = document.createElement("tr");

        const artistNames = song.artists
          .map(a => a.name)
          .join(", ");

        //  日付を新しい順にソート
        const sortedPerformances = [...song.performances].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        const latest = sortedPerformances[0];
        const latestDate = latest
        
        ? (() => {
          const d = new Date(latest.date);
          return `${d.getMonth() + 1}/${d.getDate()}[${d.getYear()-100}]`;
        })(): "-";

        const latestUrl  = latest ? latest.url  : "#";
        const videoId = getYoutubeId(latestUrl);

        // 最新を除いた履歴
        const pastPerformances = sortedPerformances.slice(1);
        let performanceCells = "";

        pastPerformances.forEach(perf => {
          performanceCells += `
            <td class="history-col">
              <a href="${perf.url}" target="_blank">
                ${
                  (() => {
                    const d = new Date(perf.date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  })()
                }

              </a>
            </td>
          `;
        });

        //  足りない分を空セルで埋める
        const emptyCount = (maxCount - 1) - pastPerformances.length;
        for (let i = 0; i < emptyCount; i++) {
          performanceCells += `<td class="history-col"></td>`;
        }

        tr.innerHTML = `
          <td class="song-cell">${song.title}</td>
          <td class="artist-cell" title="${artistNames}">
          ${artistNames}
          </td>

          <td>
            <a href="${latestUrl}" target="_blank">
              ${
                videoId
                ? `<img class="thumbnail"
                      src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg"
                      alt="thumbnail">`
                : "▶︎"
              }
            </a>
          </td>
          <td>
             ${
                latestUrl && latestUrl !== "#"
                ? `<a href="${latestUrl}" target="_blank">${latestDate}</a>`
                : latestDate
             }
          </td>
          ${performanceCells}
        `;
        tableBody.appendChild(tr);
      });
    })
    .catch(error => {
      console.error("JSON読み込みエラー:", error);
    });
}

// タブ切り替え
tabButtons.forEach(button => {
  button.addEventListener("click", 
  function() {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");
    const jsonFile = this.dataset.json;
     currentJson = jsonFile;
    loadTable(jsonFile);
  });
});

// 初期表示
currentJson = "0a.json";
loadTable(currentJson);

document.getElementById("songName").addEventListener("click", () => {
  toggleSort("title");
});

document.getElementById("newDay").addEventListener("click", () => {
  toggleSort("date");
});

songName.addEventListener('mouseover', ()=>{
  songName.style.backgroundColor = 'rgba(168, 86, 104, 0.3)'
;});
songName.addEventListener('mouseout' , ()=>{
  songName.style.backgroundColor = ''
;});

newDay.addEventListener('mouseover', ()=>{
  newDay.style.backgroundColor = 'rgba(168, 86, 104, 0.3)'
;});
newDay.addEventListener('mouseout',()=>{
  newDay.style.backgroundColor = '';
});


function toggleSort(type) {

  if (currentSort === type) {
    sortDirection *= -1;
  } else {
    currentSort = type;
    sortDirection = 1;
  }

  function updateSortIcons() {

  const songTh = document.getElementById("songName");
  const dateTh = document.getElementById("newDay");

  // いったんリセット
  songTh.textContent = "曲名";
  dateTh.textContent = "最新日付";

  songTh.addEventListener('mouseover', ()=>{
    songTh.style.backgroundColor = 'rgba(168, 86, 104, 0.3)'
  ;});
  songTh.addEventListener('mouseout', () => {
   songTh.style.backgroundColor = '';
  });


  dateTh.addEventListener('mouseover', ()=>{
   dateTh.style.backgroundColor = 'rgba(168, 86, 104, 0.3)'
  ;});
  dateTh.addEventListener('mouseout', () => {
   dateTh.style.backgroundColor = '';
  });


  if (currentSort === "title") {
    songTh.textContent = sortDirection === 1
      ? "曲名 ▲"
      : "曲名 ▼";
  }

  if (currentSort === "date") {
    dateTh.textContent = sortDirection === 1
      ? "最新日 ▲"
      : "最新日 ▼";
  }

}

updateSortIcons();
  loadTable(currentJson);
}


