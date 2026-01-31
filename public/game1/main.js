var scene, camera, rederer, mesh, composer;
var ambientLight;
var intensity = 1;
var grey = 0;

keyboard = {};
var player = { height:1.8};
var flag = 1;
var timer = 1;
var jump = 0;
var speed = 1;
var obsflag = {
  "rail":0,
  "train":0,
  "tent":0,
  "tree":0,
  "boots":0,
  "fBoost":0
}
var score = 0;
var text2;
var gameover = 0;
var hits = 0;
var duck = 0;
var railflag = treeflag = 0;
var flyingBoost = 0;
var jumpingBoots = 0;
var coinsBoost = 0;
var jumpVar = 1;
var jumpTimer = 1;
var flyingVar = 0;
var flyingTimer = 1;
var endgame = 0;
var endTimer = 1;

function setscene(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, 1000/600,0.1,1000);

  ambientLight = new THREE.AmbientLight(0xee82ee, 0.2);
  scene.add(ambientLight);

  light = new THREE.PointLight(0xee82ee, 0.8, 25);
  light.position.set(-2,6,-1);
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 25;
  scene.add(light);

  scene.add(sky);
  scene.add(meshFloor);
}
function init(){

  setscene();

  drawCar();
  scene.add(car);

  train.position.z = 1000;
  train.position.x = -4.5;
  scene.add(train);

  drawTent();
  tent.position.z = 1000;
  tent.position.x = -3.2;
  scene.add(tent);

  drawFlagPost();
  flagPost.position.z = 1000;
  flagPost.position.x = 0;
  scene.add(flagPost);

  drawTree();
  tree.position.z = 1000;
  tree.position.x = 0;
  scene.add(tree);

  drawRail();
  rail.position.z = 1000;
  rail.position.x = -1;
  scene.add(rail);

  drawBoots();
  boots.position.z = 1000;
  boots.position.x = 0;
  scene.add(boots);

  drawFlyingBoost();
  fBoost.position.z = 1000;
  fBoost.position.x = -1;
  scene.add(fBoost);


  for(var i = 0; i<6;i++){
    for(var j = 0; j<6;j++){
        addCoin(getRandomX(-2),getRandomZ());
    }
  }

  for(var i = 0; i<36;i++){
        scene.add(coinGroup[i]);
  }

  drawEnemy();

  for(var j = 0; j<7; j++){
    for(var i = 0; i<3; i++){
      drawRoad(-2+2*i,-3+3.3*j);
    }
  }
  for(var j = 0; j<21; j++){
    scene.add(roadGroup[j]);
  }

  var side = 1;
  for(var i = 0; i<2; i++){
    side *= -1;
    for(var j = 0; j<3; j++){
      drawWall(-3.5+7*i,j*10,side);
    }
  }

  for(var j = 0; j<6; j++){
    scene.add(wallGroup[j]);
  }

  text2 = document.createElement('div');
  text2.style.position = 'absolute';
  text2.style.width = 100;
  text2.style.height = 100;
  text2.style.backgroundColor = "white";
  text2.innerHTML = "SCORE: "+score;
  text2.style.top = 40 + 'px';
  text2.style.left = 470 + 'px';
  document.body.appendChild(text2);

  camera.position.set(0, player.height, -6);

  camera.lookAt(new THREE.Vector3(0, player.height, 0));

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(1000,600);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.body.appendChild(renderer.domElement);

  composer = new THREE.EffectComposer( renderer );
  var renderPass = new THREE.RenderPass( scene, camera );
  composer.addPass( renderPass );

  var effectGrayScale = new THREE.ShaderPass( THREE.LuminosityShader );
  effectGrayScale.renderToScreen = true;
  composer.addPass( effectGrayScale );

  animate();
}

function animate(){
  requestAnimationFrame(animate);
  text2.innerHTML = "SCORE: "+score;

  if(!gameover && !endgame){
    timer++;
    if(timer > 2000){
      timer = 1;
    }

    endTimer++;

    if(intensity == 1 && endTimer%50 == 0){
      intensity = 1.8;
    }
    else if(intensity == 1.8 && endTimer%50 == 0){
      intensity = 1;
    }

    ambientLight.intensity = 0.2*intensity;

    jumpTimer++;
    if(jumpTimer > 1000){
      jumpTimer = 1;
    }

    if(jumpTimer%700 == 0){
      jumpVar = 1;
    }

    flyingTimer++;
    if(flyingTimer > 1000){
      flyingTimer = 1;
    }

    if(flyingTimer%700 == 0){
      flyingVar = 0;
      jump = -1;
    }

  // To add obstacles
    if(timer%20 == 0 && !obsflag["rail"]){
      rail.position.z = 20;
      rail.position.x = getRandomX(-1);
      railflag = 0;
      obsflag["rail"] = 1;
    }
    if(timer%53 == 0 && !obsflag["tree"]){
      tree.position.z = 20;
      tree.position.x = getRandomX(0);
      treeflag = 0;
      obsflag["tree"] = 1;
    }
    if(timer%180 == 0 && !obsflag["tent"]){
      tent.position.z = 20;
      tent.position.x = getRandomX(-3.2);
      obsflag["tent"] = 1;
    }
    if(timer%402 == 0 && !obsflag["train"]){
      train.position.z = 20;
      train.position.x = getRandomX(-4.5);
      obsflag["train"] = 1;
    }
    if(endTimer%600 == 0 && !obsflag["boots"]){
      boots.position.z = 20;
      boots.position.x = getRandomX(-1.85);
      obsflag["boots"] = 1;
    }
    if(endTimer%1000 == 0 && !obsflag["fBoost"]){
      fBoost.position.z = 20;
      fBoost.position.x = getRandomX(-3);
      obsflag["fBoost"] = 1;
    }
    if(endTimer == 2970 && !obsflag["flagPost"]){
      flagPost.position.z = 20;
      obsflag["flagPost"] = 1;
    }

    if(obsflag["flagPost"]){
      flagPost.position.z -= 0.09*speed;
      if(flagPost.position.z <= -10){
        flagPost.position.z = 1000;
        obsflag["flagPost"] = 0;
      }
    }
    if(obsflag["rail"]){
      rail.position.z -= 0.09*speed;
      if(rail.position.z <= -10){
        rail.position.z = 1000;
        obsflag["rail"] = 0;
      }
    }
    if(obsflag["tree"]){
      tree.position.z -= 0.09*speed;
      if(tree.position.z <= -20){
        tree.position.z = 1000;
        obsflag["tree"] = 0;
      }
    }
    if(obsflag["train"]){
      train.position.z -= 0.2;
      if(train.position.z <= -60){
        train.position.z = 1000;
        obsflag["train"] = 0;
      }
    }
    if(obsflag["tent"]){
      tent.position.z -= 0.09*speed;
      if(tent.position.z <= -30){
        tent.position.z = 1000;
        obsflag["tent"] = 0;
      }
    }
    if(obsflag["fBoost"]){
      fBoost.position.z -= 0.09*speed;
      if(fBoost.position.z <= -10){
        fBoost.position.z = 1000;
        obsflag["fBoost"] = 0;
      }
    }
    if(obsflag["boots"]){
      boots.position.z -= 0.09*speed;
      if(boots.position.z <= -10){
        boots.position.z = 1000;
        obsflag["boots"] = 0;
      }
    }

  // To detect collision
  if(!flyingVar){
    if (car.position.z-3.6 >= rail.position.z && car.position.z-4.9 <= rail.position.z && jump == 0){
      if(car.position.x == rail.position.x-1){
        flag = 1;
        timer = 1;
        if(!railflag){
          hits++;
        }
        railflag = 1;
      }
    }
    if (car.position.z-3 >= tree.position.z && car.position.z-4.1 <= tree.position.z){
      if(car.position.x == tree.position.x-2){
        flag = 1;
        timer = 1;
        if(!treeflag){
          hits++;
        }
        treeflag = 1;
      }
    }
    if (car.position.z >= tent.position.z && car.position.z-4.9 <= tent.position.z && duck == 0){
      if(car.position.x == (tent.position.x+1.2).toFixed(3)){
        flag = 1;
        timer = 1;
        gameover = 1;
        console.log(duck);
      }
    }
    if (car.position.z+1 >= train.position.z && car.position.z-4.5 <= train.position.z){
      if(car.position.x == train.position.x+2.5){
        flag = 1;
        timer = 1;
        gameover = 1;
      }
    }
    if (car.position.z-1 >= boots.position.z && car.position.z-5 <= boots.position.z){
      if(car.position.x == (boots.position.x-0.15).toFixed(3)){
        score+=10;
        boots.position.z = 1000;
        jumpVar = 2.5;
        jumpTimer = 1;
        obsflag["boots"] = 0;
      }
    }
    if (car.position.z-1 >= fBoost.position.z && car.position.z-5 <= fBoost.position.z){
      if(car.position.x == (fBoost.position.x+1).toFixed(3)){
        score +=20;
        fBoost.position.z = 1000;
        flyingTimer = 1;
        flyingVar = 1;
        obsflag["fBoost"] = 0;
      }
    }

    for(var i = 0; i<36;i++){
      if (car.position.z-1 >= coinGroup[i].position.z && car.position.z-5 <= coinGroup[i].position.z){
        if(car.position.x == coinGroup[i].position.x){
          score++;
          coinGroup[i].position.z = 20;
          coinGroup[i].position.x = getRandomX(-2);
        }
      }
    }
  }
  if (car.position.z-3 >= flagPost.position.z && car.position.z-5 <= flagPost.position.z){
    score +=100;
    obsflag["flagPost"] = 0;
    endgame = 1;
  }

    if(hits >= 2){
      gameover = 1;
    }

    if (flag == 1){
      camera.position.set(0, camera.position.y, -6);
      if(timer%100 == 0){
        flag = 0;
      }
      speed = 0.7;
    }
    else if (flag == 0){
      camera.position.z += 0.05;
      if(camera.position.z >= -5){
        flag = -1;
      }
    }
    else if(flag == -1){
      camera.position.set(0, camera.position.y, -5);
      speed = 1;
      hits = 0;
    }

    for(var j = 0; j<6; j++){
      wallGroup[j].position.z -= 0.09*speed;
      if(wallGroup[j].position.z < -9.95){
        wallGroup[j].position.z = 20;
      }
    }

    for(var j = 0; j<21; j++){
      roadGroup[j].position.z -= 0.09*speed;
      if(roadGroup[j].position.z < -5.9){
        roadGroup[j].position.z = 6*3.3-3;
      }
    }

    for(var i = 0; i<36;i++){
      coinGroup[i].rotation.z += Math.PI / 30;
      coinGroup[i].position.z -= 0.09*speed;
      if(coinGroup[i].position.z < -6){
        coinGroup[i].position.z = 20;
      }
    }

    boots.rotation.y += 0.05;

    if(keyboard[37] && timer%5 == 0){
      if(car.position.x == 0){
        car.position.x = 2;
      }
      else if(car.position.x == -2){
        car.position.x = 0;
      }
      else if(!flyingVar){
        timer = 1;
        flag = 1;
        hits++;
      }

    }
    else if(keyboard[39] && timer%5 == 0){
      if(car.position.x == 0){
        car.position.x = -2;
      }
      else if(car.position.x == 2){
        car.position.x = 0;
      }
      else if(!flyingVar){
        timer = 1;
        flag = 1;
        hits++;
      }
    }

    if(keyboard[32]){
      grey = 1;
    }

    if(!flyingVar){
      if(keyboard[38]){
        if(jump == 0){
          jump = 1;
        }
      }
      else if(keyboard[40]){
        car.scale.y = 0.7;
        duck = 1;
      }
    }
    else{
      if(car.position.y >= 3){
        jump = 0;
      }
      else{
        jump = 1;
      }
    }

    if(jump == 1){
      car.position.y += 0.04*jumpVar;
      camera.position.y += 0.04*jumpVar;
      if(!flyingVar){
        if(car.position.y >= 1*jumpVar){
          jump = -1;
        }
      }
      else if(flyingVar){
        if(car.position.y >= 4.5){
          jump = 0;
        }
      }
    }
    else if(jump == -1){
      car.position.y -= 0.02*jumpVar;
      camera.position.y -= 0.02*jumpVar;
      if(car.position.y <= 0){
        jump = 0;
      }
    }
  }
  else{
    text2.style.top = 300 + 'px';
    text2.style.left = 410 + 'px';
    if(gameover){
      text2.innerHTML = "GAMEOVER! SCORE: "+score;
    }
    else if(endgame){
      text2.innerHTML = "CONGRATS!\nSCORE: "+score;
    }
  }

  if(grey == 1){
    composer.render()
  }
  else{
    renderer.render(scene, camera);
  }
}

function keyDown(event){
  keyboard[event.keyCode] = true;
}

function keyUp(event){
  keyboard[event.keyCode] = false;
  car.scale.y = 1;
  if(event.keyCode == 40){
    duck = 0;
  }
  if(event.keyCode == 32){
    grey = 0;
  }
}

function getRandomZ(min,max) {
  min = Math.ceil(4);
  max = Math.floor(20);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomX(n) {
  min = Math.ceil(0);
  max = Math.floor(2);
  num = Math.floor(Math.random() * (max - min + 1)) + min;

  return n+num*2;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;
