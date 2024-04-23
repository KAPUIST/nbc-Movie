const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOWQ3YWI1OWZmZTc5YmQyODA5NTRhMjQ4M2QzOWUxZSIsInN1YiI6IjYxYWIxYjkwNmMxZTA0MDA0MmI2Yzg0NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._rYfZK7OtFsmskyV66wMO10vbon3g-WxZSzZC99bEtg',
  },
};

let movieData = null;

const fetchData = async () => {
  try {
    const res = await fetch(
      'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1',
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

const renderMovieList = (movies) => {
  const $movieList = document.querySelector('.movieList');
  $movieList.innerHTML = ''; // 이전 목록을 초기화
  makeMovieList(movies, $movieList);
};

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
  try {
    if (!movieData) {
      // movieData가 없으면 API 호출
      movieData = await fetchData();
    }
    const searchedMovies = movieData.results.filter((movie) =>
      movie.title.toUpperCase().includes(searchedString)
    );
    renderMovieList(searchedMovies);
  } catch (error) {
    console.error('검색 에러:', error);
  }
});

// 페이지 로드 시 최상위 평점 영화 목록 렌더링
window.addEventListener('load', async () => {
  try {
    if (!movieData) {
      // movieData가 없으면 API 호출
      movieData = await fetchData();
    }
    renderMovieList(movieData.results);
  } catch (error) {
    console.error('에러:', error);
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
