const ctx = document.createElement("canvas").getContext("2d");
const border = 2;
const size = 200;
const text = "hello";
const font = `${size}px bold sans-serif`;
ctx.font = font;
const width = ctx.measureText(text).width + border * 200;
const height = size * 5 + border * 4;

ctx.canvas.width = width;
ctx.canvas.height = height;
ctx.font = font;
ctx.textAlign = "start";
ctx.textBaseline = "top";

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, width, height);
ctx.fillStyle = "white";
ctx.fillText(text, 2, 2);

const texture = new THREE.CanvasTexture(ctx.canvas);
// because our canvas is likely not a power of 2
// in both dimensions set the filtering appropriately.
texture.minFilter = THREE.LinearFilter;
texture.wrapS = THREE.ClampToEdgeWrapping;
texture.wrapT = THREE.ClampToEdgeWrapping;
// texture.flipY = false;

const labelMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  //side: THREE.FrontSide,
});

let { bounds, gameObject, getPlayerLocalPos, rotationParams } = char;

const dialObj = gameObjectManager.createGameObject(
  scene,
  `dialogue_${gameObject.name}`
);
makeSkinInstance(dialObj, model);

dialObj.transform.traverse((el) => {
  if (el.isMesh) {
    el.material = labelMaterial;
  }
});
