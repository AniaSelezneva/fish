import React, { useRef, useEffect } from "react";
import styles from "./styles.module.scss";
import * as THREE from "three";
import { Vector3, Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  createPlane,
  getMousePosition,
  resizeRendererToDisplaySize,
  createCamera,
  createLight,
  createControls,
  setAquarium,
  makeGameObjectManager,
  makePlayer,
  makeBubbles,
  makeCrab,
  withEyesMovement,
  withDialogue,
  createTable,
  createWater,
  setWalls,
  compose,
  pipe,
} from "./utils";

const log = console.log;
const crabLines = ["hi, Sot", "hello", "sir?"];

function Index() {
  const canvas = useRef();
  const inventory = useRef();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0B91B5");
  //scene.fog = new THREE.Fog("#0B91B5", 30, 180);
  const manager = new THREE.LoadingManager();
  const gltfLoader = new GLTFLoader(manager);
  let mouse = new Vector3(0, 0, 0);

  const raycaster = new THREE.Raycaster();
  const globals = { delta: undefined, moveSpeed: 2.7, moveDistance: 0.02 };
  const clock = new Clock();
  const camera = createCamera();
  const light = createLight(scene);
  const { floor, floorTop } = createPlane();
  const table = createTable();
  const water = createWater();
  setAquarium(scene);
  setWalls(scene);
  const gameObjectManager = makeGameObjectManager();
  const models = {
    fish: { url: "/models/fish.gltf" },
    crab: { url: "/models/crab.gltf" },
    dialogue: { url: "/models/di.gltf" },
  };

  // Add glft property to models
  for (const model of Object.values(models)) {
    gltfLoader.load(model.url, (gltf) => {
      model.gltf = gltf;
      // Cast shadow
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
    });
  }

  // Add animations property to models
  function prepModelsAndAnimations() {
    Object.values(models).forEach((model) => {
      const animsByName = {};
      model.gltf.animations.forEach((clip) => {
        animsByName[clip.name] = clip;
      });
      model.animations = animsByName;
    });
  }

  // GENERAL SETUP
  function setup() {
    scene.add(floor);
    scene.add(floorTop);
    scene.add(camera);
    scene.add(light);
    scene.add(table);
    scene.add(water);

    createControls(camera, canvas.current);

    const axesHelper = new THREE.AxesHelper(5);
    //scene.add(axesHelper);

    const withCounter = {
      bubblesTotal: 0,
    };

    // Create bubbles
    setInterval(() => {
      if (withCounter.bubblesTotal < 10) {
        makeBubbles.call(
          withCounter,
          globals,
          gameObjectManager,
          scene,
          10 - withCounter.bubblesTotal,
          floor,
          camera
        );
      }
    }, 2000);
  }

  // ******************** INIT
  const init = () => {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
      alpha: true,
      transparent: true,
    });

    prepModelsAndAnimations();

    setup();

    // CREATE PLAYER
    const playerObj = gameObjectManager.createGameObject(scene, "player");
    const player = makePlayer(
      gameObjectManager,
      playerObj,
      models.fish,
      camera
    );
    playerObj.addComponent(player);

    // CREATE CRAB
    const crabObj = gameObjectManager.createGameObject(scene, "crab");
    const crab = pipe(
      makeCrab(playerObj, crabObj, models.crab),
      withEyesMovement(playerObj),
      withDialogue(crabLines, gameObjectManager, scene, models.dialogue)
    )();

    // const crab = withDialogue.call(
    //   crabLines,
    //   gameObjectManager,
    //   scene,
    //   models.dialogue,
    //   withEyesMovement.call(
    //     playerObj,
    //     makeCrab.call(playerObj, crabObj, models.crab)
    //   )
    // );
    crabObj.addComponent(crab);

    // RENDER
    function render() {
      globals.delta = clock.getDelta();

      // SHADOW
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      gameObjectManager.update(globals);

      raycaster.setFromCamera(mouse, camera);

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    render();

    // MOUSE
    {
      // CLICK
      canvas.current.addEventListener("click", (event) => {
        mouse = getMousePosition(event);
        const intersects = raycaster.intersectObjects([floor]);

        // // Ignore clicks behind the walls
        // const didClickFloor = () => {
        //   if (intersects[0] && intersects[0].object.name.includes("floor")) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // };

        if (intersects.length > 0) {
          player.setDestToGo(intersects[0].point);
        }
      });

      // MOVE
      canvas.current.addEventListener("mousemove", (event) => {
        mouse = getMousePosition(event);

        const intersects = raycaster.intersectObjects([floor]);

        const isPlayerMoving = player.getMovingState();

        if (!isPlayerMoving && intersects.length > 0) {
          player.setDestToLook(intersects[0].point);
        }
      });
    }
  };

  useEffect(() => {
    manager.onLoad = init;
  }, []);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvas} id={styles.canv} />
      {/* <canvas ref={inventory} id={styles.inventory} /> */}
    </div>
  );
}

export default Index;
