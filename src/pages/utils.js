import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { noise } from "./perlin";
import { Matrix4, Quaternion, Vector3 } from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const log = console.log;
const width = 60;
const height = 50;

function compose(...fns) {
  return function composed(value) {
    let listOfFunctions = fns.slice();
    while (listOfFunctions.length > 0) {
      value = listOfFunctions.pop(value);
    }
    return value;
  };
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

const Terrain = (geometry, isWall) => {
  noise.seed(Math.random());
  let pos = geometry.getAttribute("position");
  let pa = pos.array;
  const hVerts = geometry.parameters.heightSegments + 1;
  const wVerts = geometry.parameters.widthSegments + 1;
  for (let j = 0; j < hVerts; j++) {
    for (let i = 0; i < wVerts; i++) {
      pa[3 * (j * wVerts + i) + 2] = isWall
        ? getRandomArbitrary(-5, 10)
        : getRandomArbitrary(-0.9, 0.2);
    }
  }
};

const createPlane = () => {
  const color = `rgb(21,162,154)`;
  const geometry = new THREE.BoxGeometry(width, height, 5, 20, 10, 10);
  const geometryTop = new THREE.PlaneGeometry(width, height, 30, 30);
  //const geometryBtm = new THREE.PlaneGeometry(80, 60, 20, 20);
  const material = new THREE.MeshPhongMaterial({
    color,
    flatShading: true,
    shininess: 3,
  });

  const floor = new THREE.Mesh(geometry, material);
  const floorTop = new THREE.Mesh(geometryTop, material);

  //const floorBtm = new THREE.Mesh(geometryBtm, material);
  floorTop.name = "floor";
  floor.name = "floor";
  floorTop.receiveShadow = true;
  floor.receiveShadow = true;

  floor.position.set(0, -5.7, 0);
  floor.rotation.set(-Math.PI / 2, 0, 0);

  floorTop.position.set(0, -2.8, 0);
  floorTop.rotation.set(-Math.PI / 2, 0, 0);

  // floorBtm.position.set(0, -4, 0);
  // floorBtm.rotation.set(-Math.PI / 2, 0, 0);

  Terrain(geometryTop, false);

  return { floor, floorTop };
};

const getMousePosition = (event) => {
  const mousePos = new THREE.Vector3();

  mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mousePos.z = 0.5;

  return mousePos;
};

const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

const createCamera = () => {
  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 500;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(20, 60, 0);

  return camera;
};

const createLight = () => {
  const light = new THREE.PointLight(0xffcc77, 1);
  light.castShadow = true;
  light.position.set(0, 20, 20);

  return light;
};

const createControls = (camera, canvas) => {
  const controls = new OrbitControls(camera, canvas);
  controls.maxPolarAngle = Math.PI / 2;

  // controls.enableZoom = false;
  // controls.enableRotate = false;
  // controls.enablePan = false;

  controls.target.set(0, 5, 0);
  controls.update();
};

const setWalls = (scene) => {
  const geometry1 = new THREE.PlaneGeometry(width + 2, 30, 20, 10);
  const geometry2 = new THREE.PlaneGeometry(height + 2, 30, 20, 10);
  const color = `white`;
  // const material = new THREE.MeshPhongMaterial({
  //   color,
  //   flatShading: true,
  //   shininess: 3,
  //   side: 2,
  //   thickness: 10,
  // });
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.2,
    side: 2,
  });

  const wall1 = new THREE.Mesh(geometry1, material);
  wall1.name = "wall1";
  const wall2 = new THREE.Mesh(geometry1, material);
  wall2.name = "wall2";
  const wall3 = new THREE.Mesh(geometry2, material);
  wall3.name = "wall3";
  const wall4 = new THREE.Mesh(geometry2, material);
  wall4.name = "wall4";
  wall1.position.set(0, 8, height / 2 + 1);
  wall2.position.set(0, 8, -height / 2 - 1);
  wall3.position.set(-width / 2 - 1, 8, 0);
  wall4.position.set(width / 2 + 1, 8, 0);

  const rotRad = Math.PI / 2;
  const vectorToRotate = new THREE.Vector3(0, 1, 0);
  wall3.rotateOnAxis(vectorToRotate, rotRad);
  wall4.rotateOnAxis(vectorToRotate, rotRad);
  // wall1.receiveShadow = true;
  // wall2.receiveShadow = true;
  scene.add(wall1);
  scene.add(wall2);
  scene.add(wall3);
  scene.add(wall4);

  //Terrain(geometry, true);

  return { wall1, wall2 };
};

const createTable = () => {
  const geometry = new THREE.BoxGeometry(300, 200, 10);
  const material = new THREE.MeshBasicMaterial({ color: "blue" });
  const table = new THREE.Mesh(geometry, material);
  table.rotation.set(-Math.PI / 2, 0, 0);
  table.position.set(0, -10, 0);

  return table;
};

const createWater = () => {
  const color = `blue`;
  const geometry = new THREE.BoxGeometry(width, 20, height);
  const material = new THREE.MeshPhongMaterial({
    color,
    flatShading: true,
    shininess: 3,
    transparent: true,
    opacity: 0.2,
  });

  const water = new THREE.Mesh(geometry, material);
  water.position.set(0, 5, 0);

  return water;
};

// ----------------------------------------------------------------------- //
class SafeArray {
  constructor() {
    this.array = [];
    this.addQueue = [];
    this.removeQueue = new Set();
  }
  get isEmpty() {
    return this.addQueue.length + this.array.length > 0;
  }
  add(element) {
    this.addQueue.push(element);
  }
  remove(element) {
    this.removeQueue.add(element);
  }
  forEach(fn) {
    this._addQueued();
    this._removeQueued();

    for (const element of this.array) {
      if (this.removeQueue.has(element)) {
        continue;
      }

      fn(element);
    }
    this._removeQueued();
  }
  _addQueued() {
    if (this.addQueue.length) {
      this.array.splice(this.array.length, 0, ...this.addQueue);
      this.addQueue = [];
    }
  }
  _removeQueued() {
    if (this.removeQueue.size) {
      this.array = this.array.filter((element) => {
        return !this.removeQueue.has(element);
      });
      this.removeQueue.clear();
    }
  }
}

const makeGameObjectManager = () => {
  const gameObjects = new SafeArray();

  const createGameObject = (parent, name) => {
    const gameObject = makeGameObject(parent, name);
    gameObjects.add(gameObject);
    return gameObject;
  };

  const removeGameObject = (gameObject) => {
    gameObject.remove();
    gameObjects.remove(gameObject);
  };

  const update = (globals) => {
    gameObjects.forEach((gameObject) => gameObject.update(globals));
  };

  return {
    createGameObject,
    update,
    removeGameObject,
    gameObjects,
  };
};

function makeGameObject(parent, name) {
  const components = [];
  const transform = new THREE.Object3D();
  parent.add(transform);
  let bounds;

  const addComponent = (component) => {
    components.push(component);
  };

  function getBounds(transform) {
    return new THREE.Box3().setFromObject(transform);
  }

  const isBubble = () => {
    return name.includes("bubble");
  };

  const update = (globals) => {
    for (const component of components) {
      component.update(globals);
    }
  };

  const remove = () => {
    isBubble();
    // There is no 'transform' in Mesh (bubbles are meshes)
    if (isBubble()) {
      components[0].sphere.removeFromParent();
      components[0].sphere.geometry.dispose();
      components[0].sphere.material.dispose();
    } else {
      transform.removeFromParent();
    }
  };

  const gameObj = {
    addComponent,
    update,
    remove,
    getBounds,
    transform,
    bounds,
    name,
  };

  return gameObj;
}

// skinInstance is a component
const makeSkinInstance = (gameObject, model) => {
  const animRoot = clone(model.gltf.scene);
  const mixer = new THREE.AnimationMixer(animRoot);
  gameObject.transform.add(animRoot);
  const actions = {};

  const setAnimation = (animName) => {
    const clip = model.animations[animName];
    // turn off all current actions
    for (const action of Object.values(actions)) {
      action.enabled = false;
    }
    // get or create existing action for clip
    const action = mixer.clipAction(clip);
    action.enabled = true;
    action.reset();
    action.play();
    actions[animName] = action;
  };

  const update = (globals) => {
    mixer.update(globals.delta);
  };

  return { setAnimation, update };
};

// player is another component
const makePlayer = (gameObjectManager, gameObject, model, camera) => {
  const skinInstance = makeSkinInstance(gameObject, model);
  gameObject.addComponent(skinInstance);
  skinInstance.setAnimation("go ");
  let transform = gameObject.transform;
  let bounds = gameObject.getBounds(transform);
  let moving = false;
  let looking = false;
  let collided = false;
  let collidedObjName; // Object the player collided with
  let rotationMatrix = new Matrix4();
  let targetQuaternion = new Quaternion();
  let destToGo = new Vector3(0, 0, 0);
  let destToLook = new Vector3(0, 0, 0);
  let lastXPosition; // not to go too far/close

  const calcTargetQuaternion = (dest) => {
    rotationMatrix.lookAt(
      new Vector3(dest.x, 0, dest.z),
      transform.position,
      transform.up
    );
    targetQuaternion.setFromRotationMatrix(rotationMatrix);
  };

  const slerp = (globals) => {
    const step = globals.delta * globals.moveSpeed;
    const finalRotation = new Quaternion().set(
      targetQuaternion.x,
      targetQuaternion.y,
      targetQuaternion.z,
      targetQuaternion.w
    );
    transform.quaternion.slerp(finalRotation, step);
  };

  const moveBack = (sideChar) => {
    // Move the player into the clear. Detect the best direction to move.
    if (
      bounds.min.x <= sideChar.bounds.max.x &&
      bounds.max.x >= sideChar.bounds.min.x
    ) {
      // Determine center then push out accordingly.
      const objectCenterX =
        (sideChar.bounds.max.x - sideChar.bounds.min.x) / 2 +
        sideChar.bounds.min.x;
      const playerCenterX = (bounds.max.x - bounds.min.x) / 2 + bounds.min.x;

      // Determine the X axis push.
      if (objectCenterX > playerCenterX) {
        transform.position.x -= 0.2;
      } else {
        transform.position.x += 0.2;
      }
    }
    if (
      bounds.min.z <= sideChar.bounds.max.z &&
      bounds.max.z >= sideChar.bounds.min.z
    ) {
      // Determine center then push out accordingly.
      const objectCenterZ =
        (sideChar.bounds.max.z - sideChar.bounds.min.z) / 2 +
        sideChar.bounds.min.z;
      const playerCenterZ = (bounds.max.z - bounds.min.z) / 2 + bounds.min.z;

      // Determine the Z axis push.
      if (objectCenterZ > playerCenterZ) {
        transform.position.z -= 0.2;
      } else {
        transform.position.z += 0.2;
      }
    }
  };

  const didCollide = () => {
    // not loaded yet
    if (gameObjectManager.gameObjects.array.length === 0) {
      return false;
    }

    // loaded
    for (let i = 0; i < gameObjectManager.gameObjects.array.length; i++) {
      const sideChar = gameObjectManager.gameObjects.array[i];
      sideChar.bounds = sideChar.getBounds(sideChar.transform); // stale
      if (
        sideChar.name != "player" &&
        sideChar.name !== "bubble" &&
        bounds.min.x <= sideChar.bounds.max.x &&
        bounds.max.x >= sideChar.bounds.min.x &&
        bounds.min.y <= sideChar.bounds.max.y &&
        bounds.max.y >= sideChar.bounds.min.y &&
        bounds.min.z <= sideChar.bounds.max.z &&
        bounds.max.z >= sideChar.bounds.min.z
      ) {
        collidedObjName = sideChar.name;

        moving = false;
        moveBack(sideChar);

        return true;
      }
    }

    // no collision detected
    collidedObjName = null;
    return false;
  };

  const cameraFollowPlayer = (camera, posX, posZ) => {
    if (posX < 10) {
      camera.position.set(posX + 40, 20, posZ);
      camera.lookAt(transform.position);
      lastXPosition = transform.position.x;
    } else {
      // don't move camera x further
      camera.position.set(camera.position.x, 20, posZ);
      camera.lookAt(
        new Vector3(lastXPosition, transform.position.y, transform.position.z)
      );
    }
  };

  const update = (globals) => {
    bounds = gameObject.getBounds(transform);
    collided = didCollide();

    // Positions
    const posX = transform.position.x;
    const posZ = transform.position.z;

    //ameraFollowPlayer(camera, posX, posZ);

    const newPosX = destToGo.x;
    const newPosZ = destToGo.z;
    // Set a multiplier in case we need negative values
    let multiplierX = 1;
    let multiplierZ = 1;
    // Detect the distance between the current pos and target
    const diffX = Math.abs(posX - newPosX);
    const diffZ = Math.abs(posZ - newPosZ);
    const distance = Math.sqrt(diffX * diffX + diffZ * diffZ);
    //Use negative multipliers if necessary
    if (posX > newPosX) {
      multiplierX = -1;
    }
    if (posZ > newPosZ) {
      multiplierZ = -1;
    }

    if (collided) {
      log(collidedObjName);
    }

    // MOVE
    if (moving && !collided) {
      slerp(globals);
      // Update the main position
      const x =
        posX +
        globals.moveDistance *
          (diffX / distance) *
          multiplierX *
          globals.moveSpeed;
      const z =
        posZ +
        globals.moveDistance *
          (diffZ / distance) *
          multiplierZ *
          globals.moveSpeed;

      transform.position.set(x, 0, z);
    }
    // LOOK
    else if (looking) {
      slerp(globals);
    }

    // Reached destination
    if (Math.floor(diffZ) === 0 && Math.floor(diffX) === 0) {
      moving = false;
    }
  };

  const setDestToGo = (dest) => {
    destToGo = dest;
    moving = true;
    calcTargetQuaternion(destToGo);
  };

  const setDestToLook = (dest) => {
    destToLook = dest;
    looking = true;
    calcTargetQuaternion(destToLook);
  };

  const getMovingState = () => {
    return moving;
  };

  return {
    setDestToLook,
    setDestToGo,
    update,
    getMovingState,
    destToLook,
    moving,
    bounds,
    skinInstance,
  };
};

// BUBBLE
function makeBubble(
  globals,
  scene,
  pos = { x: 1, y: -1, z: 3 },
  gameObjectManager,
  bubbleObj,
  camera
) {
  const sphereGeom = new THREE.SphereGeometry(
    getRandomArbitrary(0.1, 1),
    32,
    16
  );
  const blueMaterial = new THREE.MeshBasicMaterial({
    color: "blue",
    transparent: true,
    opacity: 0.2,
  });
  const sphere = new THREE.Mesh(sphereGeom, blueMaterial);
  sphere.position.set(pos.x, pos.y, pos.z);
  scene.add(sphere);

  let newX = sphere.position.x;
  let newY = sphere.position.y;
  let newZ = sphere.position.z;

  const speed = Math.abs(getRandomArbitrary(0.5, 1));

  let x = sphere.position.x;
  let y = sphere.position.y;
  let z = sphere.position.z;
  let destX = getRandomArbitrary(x - 0.5, x + 0.5);
  let destZ = getRandomArbitrary(z - 0.5, z + 0.5);
  let destY = y + 0.2;

  let topLimit = getRandomArbitrary(6, 9);

  const moveUp = () => {
    x = sphere.position.x;
    y = sphere.position.y;
    z = sphere.position.z;

    let multiplierX = 1;
    let multiplierZ = 1;

    if (
      roundToTwo(x) == roundToTwo(destX) ||
      roundToTwo(z) == roundToTwo(destZ)
    ) {
      destX = getRandomArbitrary(x - 1, x + 1);
      destZ = getRandomArbitrary(z - 1, z + 1);
      destY = y + 0.2;
    }

    const diffX = Math.abs(x - destX);
    const diffZ = Math.abs(z - destZ);
    const diffY = Math.abs(y - destY);
    const distance = Math.sqrt(diffX * diffX + diffZ * diffZ + diffY * diffY);

    if (x > destX) {
      multiplierX = -1;
    }
    if (z > destZ) {
      multiplierZ = -1;
    }

    newY = y + globals.moveDistance * (diffY / distance) * speed;
    newX = x + globals.moveDistance * (diffX / distance) * multiplierX * speed;
    newZ = z + globals.moveDistance * (diffZ / distance) * multiplierZ * speed;

    sphere.position.set(newX, newY, newZ);
  };

  const isOutOfView = () => {
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );

    frustum.setFromProjectionMatrix(matrix);
    if (!frustum.containsPoint(sphere.position)) {
      return true;
    } else {
      return false;
    }
  };

  const reachedTop = () => {
    return y >= topLimit;
  };

  const update = () => {
    moveUp();
    if (reachedTop()) {
      gameObjectManager.removeGameObject(bubbleObj);
      this.bubblesTotal--;
    }
  };

  return { update, sphere };
}

// MAKE BUBBLES
function makeBubbles(globals, gameObjectManager, scene, amount, floor, camera) {
  const bounds = new THREE.Box3().setFromObject(floor);
  const minX = bounds.min.x + 10;
  const maxX = bounds.max.x - 10;
  const minZ = bounds.min.z + 10;
  const maxZ = bounds.max.z - 10;

  for (let i = 0; i < amount; i++) {
    const bubbleObj = gameObjectManager.createGameObject(scene, `bubble${i}`);
    const position = {
      x: getRandomArbitrary(minX, maxX),
      y: getRandomArbitrary(-4, -1),
      z: getRandomArbitrary(minZ, maxZ),
    };
    const bubble = makeBubble.call(
      this,
      globals,
      scene,
      position,
      gameObjectManager,
      bubbleObj,
      camera
    );

    this.bubblesTotal++;

    bubbleObj.addComponent(bubble);
  }
}

// EYES MOVEMENT MIXIN
function withEyesMovement(char) {
  let { transform, update, gameObject, bounds, getPlayerLocalPos } = char;
  const eyes = { left: undefined, right: undefined };
  let direction = new Vector3(); // direction towards which crab's eyes will move
  const defaultDestToLook = new Vector3(-10, 0, 10);
  let playerLocalPosition = getPlayerLocalPos();

  // Traverse through crab to find eyes' bones
  transform.traverse((el) => {
    if (el.isBone) {
      if (el.name === "lefteye") {
        eyes.left = el;
      }
      if (el.name === "righteye") {
        eyes.right = el;
      }
    }
  });

  let playerObj = this;
  let destLocalPosition = new Vector3();
  let eyeLocalPos = new Vector3();
  let rotationMatrix = new Matrix4();
  let targetQ = new Quaternion();
  let destWorldPos, step;

  // CALC DESTINATION POSITION IN EYE SPACE
  const getDestLocalPos = () => {
    // Destination world position
    destWorldPos = new Vector3().copy(direction);
    // Destination position in eye space
    destLocalPosition.copy(destWorldPos);
    eyes.right.worldToLocal(destLocalPosition);
  };

  // GET EYE LOCAL POSITION (SUBVECTOR)
  const getEyeLocalPos = () => {
    eyeLocalPos.subVectors(eyes.right.position, eyes.left.position);
  };

  // ROTATE ROTATION MATRIX
  const rotateMatrix4 = () => {
    rotationMatrix.lookAt(destLocalPosition, eyeLocalPos, eyes.right.up);
  };

  // CALCULATE FINAL QUATERNION
  const setTargetQ = () => {
    targetQ.setFromRotationMatrix(rotationMatrix);
  };

  // SEE IF PLAYER IS IN THE FIELD OF VIEW
  const isPlayerInFoV = () => {
    if (
      playerObj.transform.position.x >= transform.position.x &&
      playerObj.transform.position.x <= transform.position.x + 20 &&
      playerObj.transform.position.z <= transform.position.z + 10 &&
      playerObj.transform.position.z >= transform.position.z - 10
    ) {
      return true;
    } else {
      return false;
    }
  };

  // CALCULATE EVERYTHING
  const calc = () => {
    getDestLocalPos();
    getEyeLocalPos();
    rotateMatrix4();
    setTargetQ();
  };

  // MOVE EYES
  const moveEyes = (globals) => {
    step = globals.delta * globals.moveSpeed;

    // Recalculate destination local pos, eye local pos, rotation matrix
    // and final quaternion
    calc();

    // Update eye quaternion
    eyes.left.quaternion.rotateTowards(targetQ, step);
    eyes.right.quaternion.rotateTowards(targetQ, step);
  };

  // Override update
  update = (globals) => {
    bounds = gameObject.getBounds(transform);
    playerLocalPosition = getDestLocalPos();
    // Move eyes
    if (isPlayerInFoV(playerObj)) {
      direction = playerObj.transform.position;
      moveEyes(globals);
    } else {
      direction = defaultDestToLook;
      moveEyes(globals);
    }
  };

  return Object.assign({}, char, { calc, update });
}

// SHOW DIALOGUE MIXIN
function withDialogue(gameObjectManager, scene, model, char) {
  let { bounds, gameObject, getPlayerLocalPos } = char;
  let playerLocalPosition = getPlayerLocalPos();

  const dialObj = gameObjectManager.createGameObject(
    scene,
    `dialogue_${gameObject.name}`
  );
  const { transform } = dialObj;
  const objTopCenter = {
    x: (bounds.max.x + bounds.min.x) / 2,
    y: bounds.max.y + 1,
    z: (bounds.max.z + bounds.min.z) / 2,
  };

  transform.position.set(objTopCenter.x, objTopCenter.y, objTopCenter.z);

  // Dialogue
  let dial = undefined;
  let dialSize = new Vector3();
  let dialTexture = undefined;
  let lines = this;
  let lineNum = 0;
  let line = lines[lineNum];
  let linesTotal = lines.length;
  const rotRad = Math.PI / 2;
  const vectorToRotate = new THREE.Vector3(0, 1, 0);

  let initRender = true;

  const skinInstance = makeSkinInstance(dialObj, model);
  dialObj.addComponent(skinInstance);

  createTextureWithText(line);
  addDial();

  // let initRender = true;
  let hideTimeoutId = undefined;

  function createTextureWithText() {
    const canvas = document.createElement("canvas");
    //document.getElementById("root").appendChild(canvas);
    const ctx = canvas.getContext("2d");

    canvas.width = 300;
    canvas.height = 100;

    ctx.font = "10pt Arial";
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.textAlign = "start";
    ctx.textBaseline = "start";

    const lineheight = 15;
    const lines = line.split("\n");
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 10, 30 + i * lineheight, canvas.width);
    }

    dialTexture = new THREE.CanvasTexture(canvas);
    dialTexture.flipY = false;

    dialTexture.needsUpdate = true;
  }

  function addDial() {
    const { x, y, z } = transform.position;

    transform.rotateOnAxis(vectorToRotate, rotRad);

    const light = new THREE.DirectionalLight(0xffcc77, 1);
    light.position.set(x + 1, y, z);
    light.target = transform;
    scene.add(light);

    addTextureToDial();
  }

  function addTextureToDial() {
    //Traverse through sign to assign canvas as material
    dialObj.transform.traverse((el) => {
      if (el.isMesh) {
        el.material.map = dialTexture;
        el.material.side = THREE.DoubleSide;
      }
    });
  }

  const changeText = () => {
    log(lineNum, linesTotal);
    if (lineNum < linesTotal && lineNum >= 0) {
      createTextureWithText(lines[lineNum]);
      addTextureToDial();
    } else {
      log("this line doesn't exist");
    }
  };

  const shouldShowDial = () => {
    if (
      playerLocalPosition.x > -5 &&
      playerLocalPosition.x < 5 &&
      playerLocalPosition.z < 5 &&
      playerLocalPosition.z > 0
    ) {
      return true;
    } else {
      return false;
    }
  };

  const showDial = () => {
    transform.visible = true;
  };

  const hideDial = () => {
    transform.visible = false;
  };

  // To change text
  const changeLine = () => {
    changeText(lineNum);
  };

  const update = (globals) => {
    char.update(globals);
    playerLocalPosition = getPlayerLocalPos();
    if (shouldShowDial()) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = undefined;
      showDial();
    } else {
      if (initRender) {
        hideDial();
        initRender = false;
      } else if (!hideTimeoutId) {
        hideTimeoutId = setTimeout(() => {
          hideDial();
          lineNum = lineNum++ % linesTotal;
          log(lineNum);
          changeLine(lineNum);
        }, 2000);
      }
    }
  };

  return Object.assign({}, char, { update });
}

// Base
function makeSideChar(gameObject, model, position, rotationParams) {
  const skinInstance = makeSkinInstance(gameObject, model);
  gameObject.addComponent(skinInstance);
  const transform = gameObject.transform;
  transform.position.set(position.x, position.y, position.z);
  transform.rotateOnAxis(rotationParams.vector, rotationParams.radians);
  let bounds = gameObject.getBounds(transform);
  let playerLocalPosition = new Vector3();
  const playerObj = this;

  // Get player position inside character's space
  function getPlayerLocalPos() {
    playerLocalPosition.copy(playerObj.transform.position);
    transform.worldToLocal(playerLocalPosition);

    return playerLocalPosition;
  }

  let update = () => {
    bounds = gameObject.getBounds(transform);
    getPlayerLocalPos();
  };

  return { getPlayerLocalPos, update, gameObject, bounds, transform };
}

function makeCrab(gameObject, model) {
  const position = { x: -20, y: -1, z: 10 };
  const rotationParams = {
    vector: new THREE.Vector3(0, 1, 0),
    radians: Math.PI / 2,
  };
  const playerObj = this;

  const prototype = makeSideChar.call(
    playerObj,
    gameObject,
    model,
    position,
    rotationParams
  );

  return prototype;
}

export {
  createPlane,
  getMousePosition,
  resizeRendererToDisplaySize,
  createCamera,
  createLight,
  createControls,
  setWalls,
  makeGameObjectManager,
  makePlayer,
  makeBubbles,
  makeCrab,
  withEyesMovement,
  withDialogue,
  createTable,
  createWater,
};
