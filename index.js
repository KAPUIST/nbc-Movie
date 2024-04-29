const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOWQ3YWI1OWZmZTc5YmQyODA5NTRhMjQ4M2QzOWUxZSIsInN1YiI6IjYxYWIxYjkwNmMxZTA0MDA0MmI2Yzg0NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._rYfZK7OtFsmskyV66wMO10vbon3g-WxZSzZC99bEtg',
  },
};
// 페이지 상태 변수
const moviesPerPage = 20;
let currentPage = 1;
let total_pages;
//검색상태 변수
let isSearching = false;
let currentSearchQuery = '';
// 영화 데이터 변수
let movieData = null;

// 외부API
const fetchData = async () => {
  try {
    const endpoint = isSearching
      ? `https://api.themoviedb.org/3/search/movie?query=${currentSearchQuery}&include_adult=true&language=en-US&page=${currentPage}`
      : `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${currentPage}`;
    const res = await fetch(endpoint, options);
    if (!res.ok) {
      throw new Error('에러발생!!');
    }
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
const searchData = async (value) => {
  isSearching = true;
  currentSearchQuery = value;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${currentSearchQuery}&include_adult=true&language=en-US&page=${currentPage}`,
      options
    );
    if (!res.ok) {
      throw new Error('에러발생!!');
    }
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// 페이지 로드 시 초기 데이터 로딩과 페이지네이션 설정
window.addEventListener('load', async () => {
  await loadPageData(currentPage); // 페이지 데이터 로드 및 렌더링
  setupPaginationButtons(); // 페이지네이션 버튼 설정
});
const loadPageData = async (pageNumber) => {
  const data = await fetchData(pageNumber);
  if (data) {
    total_pages = data.total_pages;
    movieData = data;
    renderMovieList(movieData.results);
    updatePageNumbers();
  }
};
// 페이지네이션 버튼 설정
const setupPaginationButtons = () => {
  const firstPage = document.getElementById('firstPage');
  firstPage.style.display = currentPage === 1 ? 'none' : 'block';

  const prevPage = document.getElementById('prev');
  prevPage.style.display = currentPage === 1 ? 'none' : 'block';

  const lastPage = document.getElementById('lastPage');
  lastPage.style.display = currentPage === total_pages ? 'none' : 'block';

  const nextPage = document.getElementById('next');
  nextPage.style.display = currentPage === total_pages ? 'none' : 'block';

  firstPage.onclick = () => goToPage(1);
  prevPage.onclick = () => goToPage(currentPage - 1);
  nextPage.onclick = () => goToPage(currentPage + 1);
  lastPage.onclick = () => goToPage(total_pages);
};
const goToPage = async (pageNumber) => {
  if (
    pageNumber >= 1 &&
    pageNumber <= total_pages &&
    pageNumber !== currentPage
  ) {
    currentPage = pageNumber;
    const data = await fetchData();
    if (data) {
      movieData = data;
      renderMovieList(movieData.results);
      updatePageNumbers();
      setupPaginationButtons();
    }
  }
};

// 새롭게 영화들을 렌더링 하기 이전에 페이지 초기화
const renderMovieList = (movies) => {
  const $movieList = document.querySelector('.movieList');
  $movieList.innerHTML = ''; // 이전 목록을 초기화
  makeMovieList(movies, $movieList);
};

//각 영화에 대한 HTML 요소를 생성
const makeMovieList = (movies, $container) => {
  movies.forEach((movie) => {
    const $movie = document.createElement('div');
    $movie.className = 'movie';
    $movie.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" />
      <h2 class='movieTitle'>${movie.title}</h2>
      <p>${movie.overview}</p>
      <p class='rating'>Rating: ${movie.vote_average}</p>
    `;
    $movie.id = movie.id;
    $container.appendChild($movie);
    $movie.addEventListener('click', () => {
      openModal(`영화 id: ${movie.id}`);
    });
  });
};

const $searchMovie = document.querySelector('.searchMovie');
$searchMovie.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchedString = e.target['search'].value.toUpperCase();

  if (searchedString) {
    // movieData가 없으면 API 호출
    try {
      currentPage = 1;
      movieData = await searchData(searchedString);
      total_pages = movieData.total_pages;
      if (movieData.results.length > 0) {
        renderMovieList(movieData.results);
        total_pages = movieData.total_pages;
        updatePageNumbers(); // 페이지네이션 업데이트
      } else {
        document.querySelector('.movieList').innerHTML =
          '<p>검색 결과가 없습니다.</p>';
        updatePageNumbers();
      }
    } catch (error) {
      console.error('검색 에러:', error);
    }
  } else {
    isSearching = false;
    try {
      currentPage = 1;
      currentSearchQuery = '';
      movieData = await fetchData();
      if (movieData.results.length > 0) {
        renderMovieList(movieData.results);
        total_pages = movieData.total_pages;
        updatePageNumbers(); // 페이지네이션 업데이트
      } else {
        document.querySelector('.movieList').innerHTML =
          '<p>검색 결과가 없습니다.</p>';
      }
    } catch (error) {
      console.error('검색 에러:', error);
    }
  }
});

//모달열기
const openModal = (message) => {
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('myModal').style.display = 'block';
};
//모달 닫기
const closeModal = () => {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
};
// 버튼 클릭시 모달 닫기
document.querySelector('.close').addEventListener('click', () => {
  closeModal();
});

// 외부 클릭시 모달 닫기
window.addEventListener('click', (event) => {
  const modal = document.getElementById('myModal');
  if (event.target === modal) {
    closeModal();
  }
});

// TOP 버튼 스크롤 이벤트
window.addEventListener('scroll', () => {
  const topButton = document.getElementById('topButton');
  if (window.scrollY > 100) {
    topButton.style.display = 'block';
  } else {
    topButton.style.display = 'none';
  }
});

document.getElementById('topButton').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 페이지네이션 번호를 업데이트하는 함수
const updatePageNumbers = () => {
  const pageNumberContainer = document.getElementById('pageNumberContainer');
  pageNumberContainer.innerHTML = ''; // 기존 페이지네이션 버튼 삭제

  // 시작 페이지 번호 계산 (현재 페이지를 중심으로, 최대 5개의 페이지 번호 표시)
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 4, total_pages);

  // 페이지 번호 버튼 생성
  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    const pageButton = document.createElement('button');
    if (endPage === 1) {
      pageButton.disabled = true;
    }
    pageButton.innerText = pageNum;
    pageButton.className = 'pageButton';
    if (currentPage === pageNum) {
      pageButton.style.backgroundColor = '#e50914';
    }
    pageButton.onclick = async () => {
      currentPage = pageNum;
      const data = await fetchData();
      if (data) {
        movieData = data;
        renderMovieList(movieData.results);
        updatePageNumbers();
      }
    };

    pageNumberContainer.appendChild(pageButton);
  }
  setupPaginationButtons();
};
