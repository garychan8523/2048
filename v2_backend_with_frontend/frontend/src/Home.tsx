import Game from "./components/Game";

function Home() {
  const gridSize = 4;
  return (
    <>
      <Game key={gridSize} size={gridSize} />
    </>
  );
}

export default Home;
