var scene,mesh , camera, renderer, composer , meshplayer;
var meshFloor1,meshFloor2 ,meshFloor3, ambientLight, light,meshtext ,meshend, meshpoints;
var coins,bcoins,bcoins1,bcoins2,pipe,bench,rock;
var clock,flash,fly,duck;
var crate , crate1 , crateTexture, crateNormalMap, crateBumpMap;
var pipeTexture;
var flr = {};
var chasing ,  jumpingboots , flyingboots , dead ,ducking;
var playerbb,racecarbb, coinsbb,cratebb,crate1bb,pipebb,bcoinsbb,bcoins1bb,bcoins2bb,benchbb,rockbb;var len;
var wall , wall1;

var loadingScreen ;
var keyboard = {};
var player = { height:1.8, speed:0.05, turnSpeed:Math.PI*0.02 , acc:0.00005 , jump:2 , points:0 , height:0};
var enemy = {speed:0.05, acc:0.0001};

var USE_WIREFRAME = false;

var loader = new THREE.FontLoader();
loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
	loadingScreen = {
		scene: new THREE.Scene(),
		camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
		box: new THREE.Mesh(
			new THREE.TextGeometry( "START", {
		
				font: font,
				size: 0.5,
				height: 0.5,
				curveSegments: 0.5,
				bevelThickness: 0.001,
				bevelSize: 0.01,
				bevelEnabled: true
			
			}),
			new THREE.MeshBasicMaterial({ color: 0xff0000, specular: 0x4444ff })
		)
	};

});

var loadingManager = null;
var RESOURCES_LOADED = false;

var models = {
	racecar: {
		obj:"models/raceCarRed.obj",
		mtl:"models/raceCarRed.mtl",
		mesh: null
	},

};

var bonus = ["models/celestial.jpg","models/flower.jpg","models/greendragon.jpg" ,"models/treeoflife.jpg"];
var meshes = {};

var bonus_meshes = {};

function init(){
	len = 0;dead = 0;
	chasing  = 0;jumpingboots = 0;flyingboots = 0;ducking=0;
	clock = new THREE.Clock();
	flash = new THREE.Clock(); flash.start();
	fly = new THREE.Clock();
	duck = new THREE.Clock();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
	
	loadingScreen.box.position.set(0,0,5);
	loadingScreen.box.rotation.y += Math.PI;
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);
	
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};

	var textureLdr = new THREE.TextureLoader(loadingManager);
	var tux = textureLdr.load("models/tux.jpg");
	var g1 = new THREE.BoxBufferGeometry( 0.6, 0.6, 0.6 ) , g2 = new THREE.BoxBufferGeometry( 1,1,1 ) ;
	var m1 = new THREE.MeshBasicMaterial( {color: 0xe59866} ) , m2 = new THREE.MeshPhongMaterial({color:0xfdfefe, 
		map:tux,
		wireframe:USE_WIREFRAME});
	
	var cubeA = new THREE.Mesh( g1, m1 );
	cubeA.position.y += 1.7;
	var cubeB = new THREE.Mesh(g2, m2 );
	cubeB.position.y += 1;
	
	meshplayer = new THREE.Group();
	meshplayer.add( cubeA );
	meshplayer.add( cubeB );
	scene.add( meshplayer );
	playerbb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	playerbb.setFromObject(meshplayer);

	var textureLdr = new THREE.TextureLoader(loadingManager);
	floorTexture = textureLdr.load("models/rails.png");
	meshFloor1= new THREE.Mesh(
		new THREE.PlaneGeometry(5,100,10,10),
		new THREE.MeshPhongMaterial({color:0xffffff, 
			map:floorTexture,
			wireframe:USE_WIREFRAME})
	);
	meshFloor1.rotation.x -= Math.PI / 2;
	meshFloor1.receiveShadow = true;

	meshFloor2 = meshFloor1.clone();
	meshFloor3 = meshFloor1.clone();
	meshFloor2.position.x = meshFloor1.position.x + 5.5;
	meshFloor3.position.x = meshFloor1.position.x - 5.5;
	flr[1] = meshFloor1.position.x;
	flr[2] = meshFloor2.position.x;
	flr[3] = meshFloor3.position.x;
	scene.add(meshFloor3);
	scene.add(meshFloor2);
	scene.add(meshFloor1);

	var textureLdr = new THREE.TextureLoader(loadingManager);
	var wallTexture = textureLdr.load("models/wall.png");
	wall = new THREE.Mesh(
		new THREE.PlaneGeometry(5,100,10,10),
		new THREE.MeshPhongMaterial({color:0xffffff, 
			map:wallTexture,
			wireframe:USE_WIREFRAME,
			transparent:true})
	);
	
	wall.receiveShadow = true;
	wall1 = wall.clone();
	wall1.rotation.y -= Math.PI / 2;
	wall1.rotation.z += Math.PI / 2;
	wall.rotation.y += Math.PI / 2;
	wall.rotation.z += Math.PI / 2;
	wall.position.x = meshFloor2.position.x - 15 ;
	wall1.position.x = meshFloor3.position.x + 15 ;
	scene.add(wall);
	scene.add(wall1);

	var textureLoader = new THREE.TextureLoader();
	crateTexture = textureLoader.load("crate0/crate0_diffuse.png");
	crateBumpMap = textureLoader.load("crate0/crate0_bump.png");
	crateNormalMap = textureLoader.load("crate0/crate0_normal.png");
	crate = new THREE.Mesh(
		new THREE.BoxGeometry(2,2,5),
		new THREE.MeshPhongMaterial({
			color:0xffffff,
			
			map:crateTexture,
			bumpMap:crateBumpMap,
			normalMap:crateNormalMap
		})
	);
	crate.position.set(flr[Math.floor(Math.random()*(3) + 1)],1,meshplayer.position.z+20)
	crate.receiveShadow = true;
	crate.castShadow = true;
	scene.add(crate);
	cratebb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	cratebb.setFromObject(crate);

	crate1 = crate.clone();
	crate1.position.set(flr[Math.floor(Math.random()*(3) + 1)] ,1,meshplayer.position.z+10)	
	scene.add(crate1);
	crate1bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	crate1bb.setFromObject(crate1);
	
	var geometry = new THREE.CylinderGeometry( 0.3, 0.3, 0.1 );
	var textureLdr1 = new THREE.TextureLoader();
	coinTexture = textureLdr1.load("models/coin.png");
	var material = new THREE.MeshPhongMaterial( {color: 0xffff00,
		map:coinTexture
	} );
	coin = new THREE.Mesh( geometry, material );
	coin.position.y += 2;
	coin.rotation.x -= Math.PI / 2;
	coin.rotation.y -= Math.PI / 2;
	coin.position.x = flr[Math.floor(Math.random()*(3) + 1)];
	coin.receiveShadow = true;
	coin.castShadow = true;
	var num = Math.floor(Math.random()*(2) + 1) + 1;
	var i,l = coin.position.z;
	coins = new THREE.Group();
	coins.add(coin)
	for (i = 1; i < num; i++) {
	  c = coin.clone();
	  c.position.z = l + 1;
	  l = c.position.z;
	  coins.add(c);
	}
	coinsbb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
	coinsbb.setFromObject(coins);
	scene.add( coins );

	var geometry = new THREE.BoxBufferGeometry( 0.5, 0.5, 0.1 ) ;
	var textureLdr1 = new THREE.TextureLoader();
	bTexture = textureLdr1.load(bonus[0]);
	var material = new THREE.MeshPhongMaterial( {color: 0xffff00,
		map:bTexture
	} );
	bcoins = new THREE.Mesh( geometry, material );
	bcoins.position.y += 2;
	bcoins.position.z = meshplayer.position.z + 15;
	bcoinsbb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
	bcoinsbb.setFromObject(bcoins);
	scene.add(bcoins);

	var geometry = new THREE.BoxBufferGeometry( 0.5, 0.5, 0.1 ) ;
	var textureLdr1 = new THREE.TextureLoader();
	bTexture = textureLdr1.load(bonus[1]);
	var material = new THREE.MeshPhongMaterial( {color: 0xffff00,
		map:bTexture
	} );
	bcoins1 = new THREE.Mesh( geometry, material );
	bcoins1.position.y += 2;
	bcoins1.position.z = meshplayer.position.z + 10;
	bcoins1.position.x = meshFloor2.position.x;
	bcoins1bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
	bcoins1bb.setFromObject(bcoins1);
	scene.add(bcoins1);

	var geometry = new THREE.BoxBufferGeometry( 0.5, 0.5, 0.1 ) ;
	var textureLdr1 = new THREE.TextureLoader();
	bTexture = textureLdr1.load(bonus[2]);
	var material = new THREE.MeshPhongMaterial( {color: 0xffff00,
		map:bTexture
	} );
	bcoins2 = new THREE.Mesh( geometry, material );
	bcoins2.position.y += 2;
	bcoins2.position.z = meshplayer.position.z + 20;
	bcoins2.position.x = meshFloor3.position.x;
	bcoins2bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
	bcoins2bb.setFromObject(bcoins2);
	scene.add(bcoins2);

	var pipeTexture = textureLdr1.load("models/wood1.jpg");
	var g1 = new THREE.BoxBufferGeometry( 2, 0.3, 0.3 ) , g2 = new THREE.BoxBufferGeometry( 0.3, 1, 0.3 ) , g3 = new THREE.BoxBufferGeometry( 0.3, 1, 0.3 ) ;
	var m1 = new THREE.MeshPhongMaterial( {color: 0x873600,map:pipeTexture} ),m2 = new THREE.MeshBasicMaterial( {color: 0x000000} ),m3 = new THREE.MeshBasicMaterial( {color: 0xe000000} ) ;
	
	var cubeA = new THREE.Mesh( g1, m1 );
	cubeA.position.y += 0.75;
	var cubeB = new THREE.Mesh(g2, m2 );
	cubeB.position.x -= 0.75;
	var cubeC = new THREE.Mesh(g3, m3 );
	cubeC.position.x += 0.75;
	bench = new THREE.Group();
	bench.add( cubeA );
	bench.add( cubeB );
	bench.add( cubeC );
	bench.position.y += 1;
	bench.position.x = flr[Math.floor(Math.random()*(3) + 1)];
	bench.position.z = meshplayer.position.z + 10;
	scene.add( bench );
	benchbb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	benchbb.setFromObject(bench);

	rock = new THREE.Mesh(
		new THREE.BoxGeometry(0.3,0.3,0.3),
		new THREE.MeshPhongMaterial({color:0x873600 , wireframe:USE_WIREFRAME})
	);
	rock.position.y += 1;
	rock.position.z = meshplayer.position.z + Math.floor(Math.random()*(2) + 1) + 5;
	// The cube can have shadows cast onto it, and it can cast shadows
	rock.receiveShadow = true;
	rock.castShadow = true;
	scene.add(rock);
	rockbb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
	rockbb.setFromObject(rock);

	var loader = new THREE.FontLoader();
	loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
	
	  var textGeometry = new THREE.TextGeometry( "SUBWAY SURFERS", {
	
		font: font,
	
		size: 1,
		height: 0.5,
		curveSegments: 1,
		bevelThickness: 0.01,
		bevelSize: 0.1,
		bevelEnabled: true
	
	  });
	  var textMaterial = new THREE.MeshPhongMaterial( 
		{ color: 0xff0000, specular: 0x4444ff }
	  );
	
	  meshtext = new THREE.Mesh( textGeometry, textMaterial );
		meshtext.rotation.y += Math.PI;
		meshtext.position.z += meshplayer.position.z + 5;
		meshtext.position.x = meshFloor2.position.x;
		meshtext.position.y += 7;
	  scene.add( meshtext );
	  console.log(meshtext);
	
	});

	var geometry = new THREE.CylinderGeometry( 0.5, 0.5, 20 );
	var textureLdr1 = new THREE.TextureLoader();
	pipeTexture = textureLdr1.load("models/wood1.jpg");
	var material = new THREE.MeshPhongMaterial( {color: 0x873600,
		map:coinTexture
	} );
	pipe = new THREE.Mesh( geometry, material );
	pipe.position.y += 1;
	pipe.position.z = meshplayer.position.z + 10 + Math.floor(Math.random()*(5) + 1)  ;
	pipe.rotation.z += Math.PI / 2;
	pipebb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
	pipebb.setFromObject(pipe);
	scene.add(pipe);

	
	ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
	
	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
	
	for( var _key in models ){
		(function(key){
			
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							node.castShadow = true;
							node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
					
				});
			});
			
		})(_key);
	}
	
	camera.position.set(0, 5, -10);
	camera.lookAt(new THREE.Vector3(0,player.height,0));

	var listener = new THREE.AudioListener();
	camera.add( listener );

	var sound = new THREE.Audio( listener );

	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'sounds/SubWay-Surfers.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );
		sound.play();
	});
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1280, 720);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	
	document.body.appendChild(renderer.domElement);
	// postprocessing

	composer = new THREE.EffectComposer( renderer );
	var renderPass = new THREE.RenderPass( scene, camera );
	composer.addPass( renderPass );
	// color to grayscale conversion

	var effectGrayScale = new THREE.ShaderPass( THREE.LuminosityShader );
	effectGrayScale.renderToScreen = true;
	composer.addPass( effectGrayScale );

	animate();
}

// Runs when all resources are loaded
function onResourcesLoaded(){
	
	meshes["racecar"] = models.racecar.mesh.clone();	
	meshes["racecar"].rotation.set(0, Math.PI, 0); // Rotate it to face the other way.
	meshes["racecar"].scale.x = 4;
	meshes["racecar"].scale.y = 4;
	meshes["racecar"].scale.z = 4;
	meshes["racecar"].position.set(meshplayer.position.x,meshplayer.position.y,meshplayer.z-20);
 	racecarbb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
	racecarbb.setFromObject(meshes["racecar"]);
	scene.add(meshes["racecar"]);
}

function animate(){
	// Play the loading screen until resources are loaded.
	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);
		
		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		//  composer.render();
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}
	if(dead == 1)
	{
		player.speed = 0;
		player.acc = 0;
	}
	meshplayer.position.y = player.height;
	playerbb.setFromObject(meshplayer);
	cratebb.setFromObject(crate);
	crate1bb.setFromObject(crate1);
	coinsbb.setFromObject(coins);
	bcoinsbb.setFromObject(bcoins);
	bcoins1bb.setFromObject(bcoins1);
	pipebb.setFromObject(pipe);
	racecarbb.setFromObject(meshes["racecar"]);
	rockbb.setFromObject(rock);
	benchbb.setFromObject(bench);
	bcoins2bb.setFromObject(bcoins2);

	if (playerbb.intersectsBox (cratebb) || playerbb.intersectsBox (crate1bb))
	{
		console.log("collision with a crate");
		player.points -= 0.1;
	}
	if(playerbb.intersectsBox (coinsbb) )
	{
		console.log("collision with  coins");
		player.points += 1;
		coins.position.z -= 20;
	}
	if(playerbb.intersectsBox (bcoins2bb) )
	{
		console.log("collision with super coin");
		player.points += 5;
		bcoins2.position.z -= 20;
	}
	if(playerbb.intersectsBox (pipebb) )
	{
		console.log("collision with pipe");
		player.points -= 0.2;
	}
	if(playerbb.intersectsBox (racecarbb) )
	{
		console.log("collision with racecar");
		console.log("POINTS : ",player.points);
		player.points = 0;
		console.log("DEAD");
	}
	if(playerbb.intersectsBox (rockbb) )
	{
		console.log("collision with rocks");
		player.speed -= 0.001;
		rock.position.z = meshplayer.position.z + 20;
	}
	if(playerbb.intersectsBox (benchbb) )
	{
		console.log("collision with bench");
		player.points -= 0.2;
	}
	
	
	
	var tt = Math.floor(flash.getElapsedTime());
	if(tt%5 == 0){
		wall.material.opacity = 0.5;
		wall1.material.opacity = 0.5;
		// scene.remove(ambientLight);
		// ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
		// scene.add(ambientLight);	
	}
	else {
		wall.material.opacity = 1;
		wall1.material.opacity = 1;
		// scene.remove(ambientLight);
		// ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		// scene.add(ambientLight);
	}

	requestAnimationFrame(animate);

	if( jumpingboots == 0 && playerbb.intersectsBox (bcoinsbb))
	{
		console.log("collided");
		player.jump = 4;
		bcoins.position.z = 10000;
		jumpingboots = 1;
		clock.start();
	}
	if(jumpingboots == 1)
	{
		var t = clock.getElapsedTime();
		if( t > 10)
		{
			console.log("elapsed");
			jumpingboots = 0;
			player.jump = 2;
		}
	}

	if( flyingboots == 0 && playerbb.intersectsBox (bcoins1bb) )
	{
		console.log("collided 1");
		player.height = 3;
		bcoins1.position.z = 10000;
		flyingboots = 1;
		fly.start();
	}
	if(flyingboots == 1)
	{
		var t = fly.getElapsedTime();
		if( t > 10)
		{
			console.log("elapsed");
			flyingboots = 0;
			player.height = 0;
		}
	}

	if( chasing == 0 && player.speed <= 0.06)
	{
		//chasing
		chasing = 1;
		meshes["racecar"].position.z = meshplayer.position.z - 5;
		meshes["racecar"].position.x = meshplayer.position.x;
		enemy.speed = player.speed;
	}
	else if(player.speed > 0.06)
		chasing = 0;
	else
	{
		meshes["racecar"].position.z += enemy.speed;
		enemy.speed += enemy.acc;
		meshes["racecar"].position.x = meshplayer.position.x;
	}

	if((meshplayer.position.z - coin.position.z ) > 10)
	{
		coin.position.x = flr[Math.floor(Math.random()*(3) + 1)] ;
		var num = Math.floor(Math.random()*(2) + 1) + 1;
		var i;
		coin.position.z = meshplayer.position.z + 20;
		coins = new THREE.Group();
		coins.add(coin)
		for (i = 1; i < num; i++) {
		  c = coin.clone();
		  c.position.z += 1;
		  coins.add(c);
		}
		scene.add( coins );
	}

	if((meshplayer.position.z - crate.position.z) > 10)
	{
		crate.position.set(flr[Math.floor(Math.random()*(3) + 1)],1,meshplayer.position.z+50);	
	}
	if((meshplayer.position.z - crate1.position.z) > 10)
	{
		crate1.position.set(flr[Math.floor(Math.random()*(3) + 1)],1,meshplayer.position.z+60);	
	}

	if(meshplayer.position.x > meshFloor2.position.x)
	{
		meshplayer.position.x = meshFloor2.position.x;
		player.speed -= 0.005;
	}
	else if(meshplayer.position.x < meshFloor3.position.x)
	{
		meshplayer.position.x = meshFloor3.position.x;
		player.speed -= 0.005;		
	}
	if(meshplayer.position.y > 0)
	{
		meshplayer.position.y -= 0.1;
	}
	
	if((meshplayer.position.z - meshFloor1.position.z) > 1)
	{
		meshFloor1.position.z += 1;
		meshFloor2.position.z += 1;
		meshFloor3.position.z += 1;
		wall.position.z += 1;
		wall1.position.z += 1;
	}
	if((meshplayer.position.z - bench.position.z) > 10)
	{
		bench.position.z = meshplayer.position.z + 20;
		bench.position.x = flr[Math.floor(Math.random()*(3) + 1)];
	}
	if((meshplayer.position.z - bcoins2.position.z) > 10)
	{
		bcoins2.position.z = meshplayer.position.z + 20;
		bcoins2.position.x = flr[Math.floor(Math.random()*(3) + 1)];
	}
	

	//coins.rotation.z += 0.02;
	meshtext.position.z += player.speed;
	meshplayer.position.z += player.speed;
	player.speed += player.acc;
	camera.position.z += player.speed;;
	light.position.z += player.speed;

	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	if(keyboard[74]){ // J for tilting the camera left 
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[76]){ // L for tilting the camera right 
		camera.rotation.y += player.turnSpeed;
	}

	if(keyboard[37]){ // left arrow key
		meshplayer.position.y += 0.5;
		meshplayer.position.x += 1.1; // find this value 
	}
	if(keyboard[38]){ // up arrow key
		meshplayer.position.y += player.jump;
	}
	if(keyboard[39]){ // right arrow key
		meshplayer.position.y += 0.5;
		meshplayer.position.x -= 1.1; // find this value 
	}
	if(keyboard[40]){ // down arrow key
		meshplayer.scale.set(0.75,0.75,0.75);
		ducking = 1;
		duck.start();
	}
	if(ducking == 1)
	{
		var t = duck.getElapsedTime();
		if( t > 5)
		{
			ducking = 0;
			meshplayer.scale.set(1.1,1.1,1.1);
		}
	}
	
	if(keyboard[71]){
		//g for greyscale
		composer.render();
	}
	else{
		//b for back to color 
		renderer.render(scene, camera);
	}
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;

