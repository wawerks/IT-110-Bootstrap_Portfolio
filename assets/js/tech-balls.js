/**
 * 3D tech balls — icon sits in front of the icosahedron in group space.
 * Only the ball (mesh) spins; the logo stays upright / does not rotate with facets.
 */
import * as THREE from 'three';

/* Matte grey low-poly ball (reference look), not cream */
const BALL_COLOR = 0xc8c8d0;
const ICO_DETAIL = 1;
const ICO_SCALE = 31;
/* Front offset & icon size in scene units (ball center at origin, camera toward +Z) */
const ICON_SURFACE_Z = ICO_SCALE * 1.06;
const ICON_RADIUS = 0.55 * ICO_SCALE;

function createBallGroup(texture, renderer) {
  const group = new THREE.Group();

  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, ICO_DETAIL),
    new THREE.MeshStandardMaterial({
      color: BALL_COLOR,
      flatShading: true,
      metalness: 0.08,
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    })
  );
  ico.scale.setScalar(ICO_SCALE);
  ico.castShadow = false;
  ico.receiveShadow = false;

  if (texture && renderer) {
    const maxAni = renderer.capabilities.getMaxAnisotropy();
    texture.anisotropy = Math.min(8, maxAni);
    texture.needsUpdate = true;

    const iconMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });

    const iconMesh = new THREE.Mesh(new THREE.CircleGeometry(ICON_RADIUS, 64), iconMat);
    /* Sibling of ball: same group position, only ball rotates */
    iconMesh.position.set(0, 0, ICON_SURFACE_Z);
    iconMesh.renderOrder = 2;
    group.add(iconMesh);
    group.userData.iconMesh = iconMesh;
  }

  group.add(ico);
  group.userData.ico = ico;

  group.userData.phase = Math.random() * Math.PI * 2;
  return group;
}

function loadTechTexture(url, renderer, onLoad, onError) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function () {
    const tex = new THREE.Texture(img);
    if (THREE.SRGBColorSpace !== undefined) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    tex.needsUpdate = true;
    onLoad(tex);
  };
  img.onerror = function () {
    if (typeof onError === 'function') onError();
  };
  img.src = url;
}

function initTechBallRow(wrap) {
  const canvas = wrap.querySelector('.tech-balls-canvas');
  const slots = wrap.querySelectorAll('.tech-ball-slot');
  if (!canvas || !slots.length) return;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
  camera.position.set(0, 0, 400);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  if (THREE.SRGBColorSpace !== undefined) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.AmbientLight(0xffffff, 0.32));
  const dir = new THREE.DirectionalLight(0xffffff, 0.65);
  dir.position.set(4, 8, 12);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0xaabbff, 0.22);
  fill.position.set(-4, 2, 6);
  scene.add(fill);

  const groups = new Array(slots.length);
  let basePositions = [];

  function layout() {
    const w = Math.max(1, wrap.clientWidth);
    const h = Math.max(1, wrap.clientHeight);
    const pr = Math.min(window.devicePixelRatio, 2);

    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);

    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();

    const hostRect = wrap.getBoundingClientRect();
    basePositions = [];

    slots.forEach(function (slot, i) {
      const r = slot.getBoundingClientRect();
      const cx = r.left + r.width / 2 - hostRect.left;
      const cy = r.top + r.height / 2 - hostRect.top;
      const wx = cx - w / 2;
      const wy = -(cy - h / 2);
      basePositions[i] = { x: wx, y: wy };
      if (groups[i]) {
        groups[i].position.set(wx, wy, 0);
      }
    });
  }

  const total = slots.length;

  slots.forEach(function (slot, index) {
    const url = slot.getAttribute('data-icon-src');
    if (!url) return;

    loadTechTexture(
      url,
      renderer,
      function (tex) {
        const g = createBallGroup(tex, renderer);
        scene.add(g);
        groups[index] = g;
        layout();
      },
      function () {
        const g = createBallGroup(null, renderer);
        scene.add(g);
        groups[index] = g;
        layout();
      }
    );
  });

  if (total === 0) return;

  layout();

  let raf = 0;
  const t0 = performance.now();

  function animate(t) {
    const time = (t - t0) * 0.001;
    for (let i = 0; i < slots.length; i++) {
      const g = groups[i];
      if (!g) continue;
      const base = basePositions[i];
      if (!base) continue;
      const ph = g.userData.phase;
      g.position.x = base.x + Math.sin(time * 1.2 + ph) * 2.5;
      g.position.y = base.y + Math.sin(time * 1.75 + ph * 1.3) * 3.5;
      g.rotation.set(0, 0, 0);

      const icoMesh = g.userData.ico;
      if (icoMesh) {
        icoMesh.rotation.y = time * 0.35 + ph * 0.2;
        icoMesh.rotation.x = Math.sin(time * 0.8 + ph) * 0.08;
        icoMesh.rotation.z = 0;
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  const ro = new ResizeObserver(function () {
    layout();
  });
  ro.observe(wrap);

  window.addEventListener('load', layout);
  raf = requestAnimationFrame(animate);

  wrap.addEventListener(
    'tech-balls-dispose',
    function () {
      cancelAnimationFrame(raf);
      ro.disconnect();
      groups.forEach(function (g) {
        if (!g) return;
        g.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (o.material.map) o.material.map.dispose();
            o.material.dispose();
          }
        });
        scene.remove(g);
      });
      renderer.dispose();
    },
    { once: true }
  );
}

document.querySelectorAll('.tech-balls-row-wrap').forEach(function (wrap) {
  initTechBallRow(wrap);
});
