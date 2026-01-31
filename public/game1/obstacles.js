train = new THREE.Group();
var fcratetexture = THREE.ImageUtils.loadTexture('./images/truck_b-256.png');
var cratetexture = THREE.ImageUtils.loadTexture('./images/truck_material-new-256.png');
var nmfcratetexture = THREE.ImageUtils.loadTexture('./images/truck_b-nm-256.png');
var nmcratetexture = THREE.ImageUtils.loadTexture('./images/truck_material-new-256-nm.png');

var cubeMaterial = [
    new THREE.MeshPhongMaterial({
        map: cratetexture,
        normalMap: nmcratetexture //left
    }),
    new THREE.MeshPhongMaterial({
        map: cratetexture,
        normalMap: nmcratetexture //right
    }),
    new THREE.MeshPhongMaterial({
        map: cratetexture,
        normalMap: nmcratetexture // top
    }),
    new THREE.MeshPhongMaterial({
        map: cratetexture,
        normalMap: nmcratetexture // bottom
    }),
    new THREE.MeshPhongMaterial({
        map: cratetexture,
        normalMap: nmcratetexture // front
    }),
    new THREE.MeshPhongMaterial({
        map: fcratetexture,
        normalMap: nmfcratetexture //back
    })
];

//crateTexture = textureLoader.load("./truck/truck_b-256.png");
//crateBumpMap = textureLoader.load("truck/");
//crateNormalMap = textureLoader.load("./truck/truck_b-nm-256.png");

var crate = new THREE.Mesh(
  new THREE.BoxGeometry(1.7,3,10),
  cubeMaterial
);
crate.position.set(2.5,3/2,2.5);
crate.receiveShadow = true;
crate.castShadow = true;
train.add(crate);

tent = new THREE.Group();
function drawTent(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/tentLong.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/tentLong.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.z = 2;
      mesh.position.x = 2;
      mesh.rotation.y -= Math.PI/2;
      mesh.scale.set(1.8,1.4,1.8);
      tent.add(mesh);
    })
  })
}

tree = new THREE.Group();
function drawTree(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/treeLarge.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/treeLarge.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.z = 1;
      mesh.position.x -= 2;
      mesh.rotation.y -= Math.PI;
      mesh.scale.set(1.8,2,1.6);
      tree.add(mesh);
    })
  })
}

rail = new THREE.Group();
function drawRail(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/railDouble.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/railDouble.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.z = 2;
      mesh.position.x -= 2;
      mesh.rotation.y -= Math.PI;
      mesh.scale.set(1.8,2.8,1.6);
      rail.add(mesh);
    })
  })
}

flagPost = new THREE.Group();
function drawFlagPost(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/overheadLights.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/overheadLights.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.x += 3;
      //mesh.rotation.y -= Math.PI/2;
      mesh.scale.set(6,6,1);
      flagPost.add(mesh);
    })
  })
}
