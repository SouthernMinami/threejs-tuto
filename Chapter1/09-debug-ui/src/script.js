import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui'

/**
 * Debug UI
 */
const gui = new GUI({
    width : 300,
    height: 300,
    title: 'Yabai Debug GUI', 
    closeFolders: false,
})
// gui.close()

// hide the gui
gui.hide()
window.addEventListener('keydown', (e) => {
    if(e.key === 'h'){
        gui.show(gui._hidden)
    }
})

const debugObj = {}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
debugObj.color = '#3f3f3f'

const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({ color: debugObj.color, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Folder
const cubeTweaks = gui.addFolder('Awesome Cube')
cubeTweaks.close()

// gui.add(mesh.position, 'y') // just add a y property
cubeTweaks
    .add(mesh.position, 'y', -3, 3, 0.01)
    .name('elevation') // add a y property with a min, max, step and a slider name

// checkbox of visibility
cubeTweaks
    .add(mesh, 'visible')

// checkbox to see the wireframe of the mesh
cubeTweaks
    .add(material, 'wireframe')

// color
cubeTweaks
    .addColor(debugObj, 'color')
    .onChange((colorVal) => {
    // retrieve the code of color internally used in Three.js
    console.log(colorVal.getHexString())
    colorVal.set(debugObj.color)
})

// You cannot send any function to lil-gui
// const func = () => {
//     console.log("function to lil-gui")
// }
// gui.add(func, '...')

// You can via a debug object
debugObj.spin = () => {
    gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 })
}
cubeTweaks.add(debugObj, 'spin')

// add subdivision property
// gui.add(geometry, 'widthSegments') generates whole geometry only once
// so widthSegments is not a property, subdivision instead
debugObj.subdivision = 3
gui.add(debugObj, 'subdivision', 0, 10, 1).onFinishChange(() => {
    console.log("subdivision finished being changed")
    // mesh.geometry = new THREE.BoxGeometry(1,1,1, debugObj.subdivision, debugObj.subdivision, debugObj.subdivision)
    // ↑ This is not good because the old geometries are remaining in memory
    // which results in a memory leak
    // ↓ Call the dispose() to the old geometry
    mesh.geometry.dispose()
    mesh.geometry = new THREE.BoxGeometry(1,1,1, debugObj.subdivision, debugObj.subdivision, debugObj.subdivision)
})


// lil-gui can only modify properties, not update a variable
// const variable = 1000
// gui.add(variable, '...')

// You can create an object to hold properties
const obj = {
    val: 1000
}

gui.add(obj, 'val', 0, 1000)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()