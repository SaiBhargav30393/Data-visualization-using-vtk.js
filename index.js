import '@kitware/vtk.js/favicon';
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import macro from '@kitware/vtk.js/macros';
import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolumeController from '@kitware/vtk.js/Interaction/UI/VolumeController';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import vtkFPSMonitor from '@kitware/vtk.js/Interaction/UI/FPSMonitor';
import vtkImageCropFilter from '@kitware/vtk.js/Filters/General/ImageCropFilter';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import  controlPanel from "./controlPanel.html";
import style from 'style-loader!css-loader?modules!./VolumeViewer.css';

let autoInit = true;
const userParams = vtkURLExtract.extractURLParameters();
const fpsMonitor = vtkFPSMonitor.newInstance();


// ----------------------------------------------------------------------------

function emptyContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

// ----------------------------------------------------------------------------

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// ----------------------------------------------------------------------------

function setupMultiSlice({ renderer2, renderWindow2, source: data }) {
  const imageActorI = vtkImageSlice.newInstance();
  const imageActorJ = vtkImageSlice.newInstance();
  const imageActorK = vtkImageSlice.newInstance();

  renderer2.addActor(imageActorK);
  renderer2.addActor(imageActorJ);
  renderer2.addActor(imageActorI);

  //-------------------------------
  //-------------------------------

  function updateColorLevel(e) {
    const colorLevel = Number(
      (e ? e.target : document.querySelector(".colorLevel")).value
    );
    imageActorI.getProperty().setColorLevel(colorLevel);
    imageActorJ.getProperty().setColorLevel(colorLevel);
    imageActorK.getProperty().setColorLevel(colorLevel);
    renderWindow2.render();
  }

  function updateColorWindow(e) {
    const colorLevel = Number(
      (e ? e.target : document.querySelector(".colorWindow")).value
    );
    imageActorI.getProperty().setColorWindow(colorLevel);
    imageActorJ.getProperty().setColorWindow(colorLevel);
    imageActorK.getProperty().setColorWindow(colorLevel);
    renderWindow2.render();
  }

  //-------------------------------

  const imageMapperK = vtkImageMapper.newInstance();
  imageMapperK.setInputData(data);
  imageMapperK.setKSlice(30);
  imageActorK.setMapper(imageMapperK);

  const imageMapperJ = vtkImageMapper.newInstance();
  imageMapperJ.setInputData(data);
  imageMapperJ.setJSlice(30);
  imageActorJ.setMapper(imageMapperJ);

  const imageMapperI = vtkImageMapper.newInstance();
  imageMapperI.setInputData(data);
  imageMapperI.setISlice(30);
  imageActorI.setMapper(imageMapperI);

  global.imageActorI = imageActorI;
  global.imageActorJ = imageActorJ;
  global.imageActorK = imageActorK;

  document.querySelector(".sliceI").addEventListener("input", (e) => {
    imageActorI.getMapper().setISlice(Number(e.target.value));
    renderWindow2.render();
  });

  document.querySelector(".sliceJ").addEventListener("input", (e) => {
    imageActorJ.getMapper().setJSlice(Number(e.target.value));
    renderWindow2.render();
  });

  document.querySelector(".sliceK").addEventListener("input", (e) => {
    imageActorK.getMapper().setKSlice(Number(e.target.value));
    renderWindow2.render();
  });

  //----new part for slices
  const dataRange = data.getPointData().getScalars().getRange();
  const extent = data.getExtent();

  [".sliceI", ".sliceJ", ".sliceK"].forEach((selector, idx) => {
    const el = document.querySelector(selector);
    el.setAttribute("min", extent[idx * 2 + 0]);
    el.setAttribute("max", extent[idx * 2 + 1]);
    el.setAttribute("value", 30);
  });

  [".colorLevel", ".colorWindow"].forEach((selector) => {
    document.querySelector(selector).setAttribute("max", dataRange[1]);
    document.querySelector(selector).setAttribute("value", dataRange[1]);
  });
  document
    .querySelector(".colorLevel")
    .setAttribute("value", (dataRange[0] + dataRange[1]) / 2);
  updateColorLevel();
  updateColorWindow();

  document.querySelector(".sliceI").addEventListener("input", (e) => {
    imageActorI.getMapper().setISlice(Number(e.target.value));
    renderWindow2.render();
  });

  document.querySelector(".sliceJ").addEventListener("input", (e) => {
    imageActorJ.getMapper().setJSlice(Number(e.target.value));
    renderWindow2.render();
  });

  document.querySelector(".sliceK").addEventListener("input", (e) => {
    imageActorK.getMapper().setKSlice(Number(e.target.value));
    renderWindow2.render();
  });

  document
    .querySelector(".colorLevel")
    .addEventListener("input", updateColorLevel);
  document
    .querySelector(".colorWindow")
    .addEventListener("input", updateColorWindow);

  global.imageActorI = imageActorI;
  global.imageActorJ = imageActorJ;
  global.imageActorK = imageActorK;
  //---- end of new part

  document
    .querySelector(".colorLevel")
    .addEventListener("input", updateColorLevel);
  document
    .querySelector(".colorWindow")
    .addEventListener("input", updateColorWindow);
  renderer2.resetCamera();
  renderWindow2.render();
}

// ---------------------------------------------------------------------------- end of setupmultislice


// cropper
function setupCropper({renderer3,renderWindow3}){
  function setupControlPanel(data, cropFilter) {
    const axes = ['I', 'J', 'K'];
    const minmax = ['min', 'max'];
  
    const extent = data.getExtent();
  
    axes.forEach((ax, axi) => {
      minmax.forEach((m, mi) => {
        const el = document.querySelector(`.${ax}${m}`);
        el.setAttribute('min', extent[axi * 2]);
        el.setAttribute('max', extent[axi * 2 + 1]);
        el.setAttribute('value', extent[axi * 2 + mi]);
  
        el.addEventListener('input', () => {
          const planes = cropFilter.getCroppingPlanes().slice();
          planes[axi * 2 + mi] = Number(el.value);
          cropFilter.setCroppingPlanes(...planes);
          console.log(planes);
          renderWindow3.render();
        });
      });
    });
  }
  
  // ----------------------------------------------------------------------------
  // Example code
  // ----------------------------------------------------------------------------
  // Server is not sending the .gz and with the compress header
  // Need to fetch the true file name and uncompress it locally
  // ----------------------------------------------------------------------------
  
  // create filter
  const cropFilter = vtkImageCropFilter.newInstance();
  
  const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
  
  const actor = vtkVolume.newInstance();
  const mapper = vtkVolumeMapper.newInstance();
  mapper.setSampleDistance(1.1);
  actor.setMapper(mapper);
  
  // create color and opacity transfer functions
  const ctfun = vtkColorTransferFunction.newInstance();
  ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
  ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
  ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
  ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
  const ofun = vtkPiecewiseFunction.newInstance();
  ofun.addPoint(0.0, 0.0);
  ofun.addPoint(255.0, 1.0);
  actor.getProperty().setRGBTransferFunction(0, ctfun);
  actor.getProperty().setScalarOpacity(0, ofun);
  actor.getProperty().setScalarOpacityUnitDistance(0, 3.0);
  actor.getProperty().setInterpolationTypeToLinear();
  actor.getProperty().setUseGradientOpacity(0, true);
  actor.getProperty().setGradientOpacityMinimumValue(0, 2);
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumValue(0, 20);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setShade(true);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);
  
  
  reader.setUrl(`https://kitware.github.io/vtk-js/data/volume/headsq.vti`).then(() => {
    reader.loadData().then(() => {
      renderer3.addVolume(actor);
  
      const data = reader.getOutputData();
      cropFilter.setCroppingPlanes(...data.getExtent());
  
      setupControlPanel(data, cropFilter);
  
      const interactor = renderWindow3.getInteractor();
      interactor.setDesiredUpdateRate(15.0);
      renderer3.resetCamera();
      renderWindow3.render();
      
    });
  });
  cropFilter.setInputConnection(reader.getOutputPort());
  mapper.setInputConnection(cropFilter.getOutputPort());
  
  // -----------------------------------------------------------
  // Make some variables global so that you can inspect and
  // modify objects in your browser's developer console:
  // -----------------------------------------------------------
  
  global.source = reader;
  global.mapper = mapper;
  global.actor = actor;
  global.ctfun = ctfun;
  global.ofun = ofun;
  global.renderer = renderer3;
  global.renderWindow = renderWindow3;
  global.cropFilter = cropFilter;
}
function setupIso({renderer4,renderWindow4}){
  const actor2 = vtkActor.newInstance();
  const mapper2 = vtkMapper.newInstance();
  const marchingCube = vtkImageMarchingCubes.newInstance({
    contourValue: 0.0,
    computeNormals: true,
    mergePoints: true,
  });

actor2.setMapper(mapper2);
mapper2.setInputConnection(marchingCube.getOutputPort());

function updateIsoValue(e) {
  const isoValue = Number(e.target.value);
  marchingCube.setContourValue(isoValue);
  renderWindow4.render();
}

  const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
  marchingCube.setInputConnection(reader.getOutputPort());
  const __BASE_PATH__ = 'https://kitware.github.io/vtk-js';
  reader
    .setUrl(`${__BASE_PATH__}/data/volume/headsq.vti`, { loadData: true })
    .then(() => {
      const data = reader.getOutputData();
      const dataRange = data.getPointData().getScalars().getRange();
      const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;

      const el = document.querySelector('.isoValue');
      el.setAttribute('min', dataRange[0]);
      el.setAttribute('max', dataRange[1]);
      el.setAttribute('value', firstIsoValue);
      el.addEventListener('input', updateIsoValue);

      marchingCube.setContourValue(firstIsoValue);
      renderer4.addActor(actor2);
      renderer4.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
      renderer4.resetCamera();
      renderWindow4.render();
    });

 
  global.actor = actor2;
  global.mapper = mapper2;
  global.marchingCube = marchingCube;
}

//end of cropper
//-----------------------------------------------------------------------------
function createViewer(rootContainer, fileContents, options) {
  const div1 = document.createElement("div");
  document.body.appendChild(div1);
  const div2 = document.createElement("div");
  document.body.appendChild(div2);
  const div3 = document.createElement("div");
  document.body.appendChild(div3);
  const div4 = document.createElement("div");
  document.body.appendChild(div4);
  const background = options.background
    ? options.background.split(",").map((s) => Number(s))
    : [0, 0, 0];
  const containerStyle = options.containerStyle;
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background,
    rootContainer:div1,
    containerStyle
  });
  const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    background: [0, 0, 0], 
  },
  { rootContainer: div2    }
  );
  //slicer
  const fullScreenRender1 = vtkFullScreenRenderWindow.newInstance({
    background: [0, 0, 0],  
  },
  { rootContainer: div3}
  );
  const fullScreenRender2 = vtkFullScreenRenderWindow.newInstance({
    background: [0, 0, 0],  
  },
  { rootContainer: div4}
  );
  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  renderWindow.getInteractor().setDesiredUpdateRate(15);

  //piecewise
  fullScreenRenderer.getContainer().style.height = "50%"
  fullScreenRenderer.getContainer().style.width = "50%"
  fullScreenRenderer.getContainer().style.right = "50%"
  fullScreenRenderer.getContainer().style.bottom= "50%"
  fullScreenRenderer.resize()
  //cropper
  fullScreenRenderWindow.getContainer().style.height = "50%"
  fullScreenRenderWindow.getContainer().style.width = "50%"
  fullScreenRenderWindow.getContainer().style.left= "50%"
  fullScreenRenderWindow.getContainer().style.bottom= "50%"
  fullScreenRenderWindow.resize()
  
  const renderer3 = fullScreenRenderWindow.getRenderer();
  const renderWindow3 = fullScreenRenderWindow.getRenderWindow();

  //slicer
  fullScreenRender1.getContainer().style.height = "50%"
  fullScreenRender1.getContainer().style.width = "50%"
  fullScreenRender1.getContainer().style.right = "50%"
  fullScreenRender1.getContainer().style.top ="50%"
  fullScreenRender1.resize()
  const renderer2 = fullScreenRender1.getRenderer();
  const renderWindow2 = fullScreenRender1.getRenderWindow();
 //iso
  fullScreenRender2.getContainer().style.height = "50%"
  fullScreenRender2.getContainer().style.width = "50%"
  fullScreenRender2.getContainer().style.left = "50%"
  fullScreenRender2.getContainer().style.top ="50%"
  fullScreenRender2.resize()
  const renderer4 = fullScreenRender2.getRenderer();
  const renderWindow4 = fullScreenRender2.getRenderWindow();


  const vtiReader =vtkXMLImageDataReader.newInstance({ fetchGzip: true });
  vtiReader.parseAsArrayBuffer(fileContents);

  const source = vtiReader.getOutputData();

  const mapper = vtkVolumeMapper.newInstance();
  const actor = vtkVolume.newInstance();

  const dataArray =
    source.getPointData().getScalars() || source.getPointData().getArrays()[0];
  const dataRange = dataArray.getRange();
  
  const lookupTable = vtkColorTransferFunction.newInstance();
  const piecewiseFunction = vtkPiecewiseFunction.newInstance();
  fullScreenRenderer.addController(controlPanel);

  // Pipeline handling
  actor.setMapper(mapper);
  mapper.setInputData(source);
  renderer.addActor(actor);

  setupMultiSlice({ source, renderer2, renderWindow2 });
  setupCropper({renderer3,renderWindow3});
  setupIso({renderer4,renderWindow4});

  // Configuration
  const sampleDistance =
    0.7 *
    Math.sqrt(
      source
        .getSpacing()
        .map((v) => v * v)
        .reduce((a, b) => a + b, 0)
    );
  mapper.setSampleDistance(sampleDistance);
  actor.getProperty().setRGBTransferFunction(0, lookupTable);
  actor.getProperty().setScalarOpacity(0, piecewiseFunction);
  actor.getProperty().setInterpolationTypeToFastLinear();
  actor.getProperty().setInterpolationTypeToLinear();

  // For better looking volume rendering
  // - distance in world coordinates a scalar opacity of 1.0
  actor
    .getProperty()
    .setScalarOpacityUnitDistance(
      0,
      vtkBoundingBox.getDiagonalLength(source.getBounds()) /
        Math.max(...source.getDimensions())
    );
  // - control how we emphasize surface boundaries
  //  => max should be around the average gradient magnitude for the
  //     volume or maybe average plus one std dev of the gradient magnitude
  //     (adjusted for spacing, this is a world coordinate gradient, not a
  //     pixel gradient)
  //  => max hack: (dataRange[1] - dataRange[0]) * 0.05

  actor.getProperty().setGradientOpacityMinimumValue(0, 0);
  actor
    .getProperty()
    .setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);
  // - Use shading based on gradient
  actor.getProperty().setShade(true);
  actor.getProperty().setUseGradientOpacity(0, true);
  // - generic good default
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);

  // Control UI
  const controllerWidget = vtkVolumeController.newInstance({
    size: [280, 150],
    
    rescaleColorMap: true
  });
  const isBackgroundDark = background[0] + background[1] + background[2] < 1.5;
  controllerWidget.setContainer(rootContainer);
  controllerWidget.setupContent(renderWindow, actor, isBackgroundDark);

  // setUpContent above sets the size to the container.
  // We need to set the size after that.
  // controllerWidget.setExpanded(false);

  fullScreenRenderer.setResizeCallback(({ width, height }) => {
   
    
    controllerWidget.render();
    fpsMonitor.update();
  });

  // First render
  renderer.resetCamera();
  renderWindow.render();

  global.pipeline = {
    actor,
    renderer,
    renderWindow,
    lookupTable,
    mapper,
    source,
    piecewiseFunction,
    fullScreenRenderer
  };

  if (userParams.fps) {
    const fpsElm = fpsMonitor.getFpsMonitorContainer();
    fpsElm.classList.add(style.fpsMonitor);
    fpsMonitor.setRenderWindow(renderWindow);
    fpsMonitor.setContainer(rootContainer);
    fpsMonitor.update();
  }
}

// ----------------------------------------------------------------------------

export function load(container, options) {
  autoInit = false;
  emptyContainer(container);

  if (options.file) {
    if (options.ext === "vti") {
      const reader = new FileReader();
      reader.onload = function onLoad(e) {
        createViewer(container, reader.result, options);
      };
      reader.readAsArrayBuffer(options.file);
    } else {
      console.error("Unkown file...");
    }
  } 

}

export function initLocalFileLoader(container) {
  const exampleContainer = document.querySelector(".content");
  const rootBody = document.querySelector("body");
  const myContainer = container || exampleContainer || rootBody;

  const fileContainer = document.createElement("div");
  fileContainer.innerHTML = `<button class = "${style.dropButton}">Upload or Drag of File Here</button><div class="${style.bigFileDrop}"/><input type="file" accept=".vti" style="display: none;"/>`;
  myContainer.appendChild(fileContainer);

  const fileInput = fileContainer.querySelector("input");

  function handleFile(e) {
    preventDefaults(e);
    const dataTransfer = e.dataTransfer;
    const files = e.target.files || dataTransfer.files;
    if (files.length === 1) {
      myContainer.removeChild(fileContainer);
      const ext = files[0].name.split(".").slice(-1)[0];
      const options = { file: files[0], ext, ...userParams };
      load(myContainer, options);
    }
  }

  fileInput.addEventListener("change", handleFile);
  fileContainer.addEventListener("drop", handleFile);
  fileContainer.addEventListener("click", (e) => fileInput.click());
  fileContainer.addEventListener("dragover", preventDefaults);
}

// Look at URL an see if we should load a file
// ?fileURL=https://data.kitware.com/api/v1/item/59cdbb588d777f31ac63de08/download
if (userParams.fileURL) {
  const exampleContainer = document.querySelector(".content");
  const rootBody = document.querySelector("body");
  const myContainer = exampleContainer || rootBody;
  load(myContainer, userParams);
}

const viewerContainers = document.querySelectorAll(".vtkjs-volume-viewer");
let nbViewers = viewerContainers.length;
while (nbViewers--) {
  const viewerContainer = viewerContainers[nbViewers];
  const fileURL = viewerContainer.dataset.url;
  const options = {
    containerStyle: { height: "100%" },
    ...userParams,
    fileURL
  };
  load(viewerContainer, options);
}

// Auto setup if no method get called within 100ms
setTimeout(() => {
  if (autoInit) {
    initLocalFileLoader();
  }
}, 100);
