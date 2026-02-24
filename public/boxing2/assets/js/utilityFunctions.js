function playerCollision({ rec1, rec2 }) {
  return (
    rec1.attackBox.position.x + rec1.attackBox.width >= rec2.position.x  &&
    rec1.position.x <= rec2.attackBox.position.x + rec2.attackBox.width && 
    rec1.position.y + rec1.attackBox.height >= rec2.position.y  
  );
}

/*
rec1.attackBox.position.x + rec1.attackBox.width >= rec2.position.x &&
    rec1.attackBox.position.x <= rec2.position.x + rec2.width &&
    rec1.attackBox.position.y + rec1.attackBox.height >= rec2.position.y &&
    rec1.attackBox.position.y <= rec2.position.y + rec2.height

    
*/

function getWinner({ player, enemy, timerSet }) {
  clearTimeout(timerSet); //function to stop timer after winner has been decided b4 game timer ends
  if (player.health === enemy.health) {
    document.getElementById("result").innerHTML = "TIE";
    document.getElementById("result").style.display = "flex";
  } else if (player.health >= enemy.health) {
    document.getElementById("result").innerHTML = "Player One Wins";
    document.getElementById("result").style.display = "flex";
  } else if (player.health <= enemy.health) {
    document.getElementById("result").innerHTML = "Player Two Wins";
    document.getElementById("result").style.display = "flex";
  }
}

const time = document.getElementById("timer");

let timer = 40;
let timerSet;
function gameTimer() {
  timerSet = setTimeout(gameTimer, 1000);
  if (timer > 0) {
    timer--;
    time.innerHTML = timer;
  }

  if (timer === 0) {
    getWinner({ player, enemy, timerSet });
  }
}
