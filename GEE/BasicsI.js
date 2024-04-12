
var forest = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      }
    ] */
    ee.Feature(
        ee.Geometry.MultiPolygon(
            [[[[85.25891513404501, 27.743863727358722],
               [85.25891513404501, 27.736798904145456],
               [85.26938647803915, 27.736798904145456],
               [85.26938647803915, 27.743863727358722]]],
             [[[85.31590084603613, 27.707812997659605],
               [85.31590084603613, 27.707808248378054],
               [85.31590084603613, 27.707808248378054],
               [85.31590084603613, 27.707812997659605]]]], null, false),
        {
          "label": "forest",
          "system:index": "0"
        }),
    water = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Feature(
        ee.Geometry.Polygon(
            [[[85.31560102458423, 27.708236118970355],
              [85.31560102458423, 27.707333755262628],
              [85.31606772895282, 27.707333755262628],
              [85.31606772895282, 27.708236118970355]]], null, false),
        {
          "label": "water",
          "system:index": "0"
        }),
    ranipokhari = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Feature(
        ee.Geometry.Polygon(
            [[[85.3156152962621, 27.708141221067596],
              [85.3156152962621, 27.707305346844922],
              [85.31619465340931, 27.707305346844922],
              [85.31619465340931, 27.708141221067596]]], null, false),
        {
          "label": "ranipokhari",
          "system:index": "0"
        }),
    siddhapokhari = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Feature(
        ee.Geometry.Polygon(
            [[[85.41975414316316, 27.67212663946728],
              [85.41975414316316, 27.671713316122112],
              [85.42117571394105, 27.671713316122112],
              [85.42117571394105, 27.67212663946728]]], null, false),
        {
          "label": "siddhapokhari",
          "system:index": "0"
        }),
    manohara = /* color: #98ff00 */ee.Feature(
        ee.Geometry.Polygon(
            [[[85.35454424916792, 27.67262466303334],
              [85.35458180009412, 27.672752934893033],
              [85.35478564797926, 27.67302373054672],
              [85.35490902959394, 27.673242266900704],
              [85.35502168237257, 27.673617578314698],
              [85.35518261491346, 27.67395013165484],
              [85.35528990327406, 27.67425893027861],
              [85.3550645977168, 27.67429218546296],
              [85.35501631795454, 27.674021392953186],
              [85.35489830075788, 27.673845614999887],
              [85.35484465657758, 27.67367458753062],
              [85.35479637681532, 27.673403793490078],
              [85.35467299520063, 27.67321376218366],
              [85.35452815591383, 27.672904960605823],
              [85.35441013871717, 27.67266742033663]]]),
        {
          "label": "manohara",
          "system:index": "0"
        }),
    roi = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[83.70892074495738, 28.0316716532509],
          [83.70892074495738, 26.891137029333517],
          [86.48846176058238, 26.891137029333517],
          [86.48846176058238, 28.0316716532509]]], null, false),
    narayani = /* color: #ffc82d */ee.Feature(
        ee.Geometry.Polygon(
            [[[84.2444284979252, 27.6285873428887],
              [84.24515805877725, 27.627864926177793],
              [84.24781881012002, 27.629613926855445],
              [84.25095163024942, 27.631933210739632],
              [84.25314031280557, 27.634404524726865],
              [84.25489984191934, 27.636571631066435],
              [84.25704560913125, 27.638890767503565],
              [84.25846181549112, 27.64075364477839],
              [84.25768933929483, 27.641095802462587],
              [84.25524316467325, 27.638396529433486],
              [84.2530544821171, 27.63630549751176],
              [84.2513807836918, 27.634138385901828],
              [84.24914918579141, 27.632123313796765],
              [84.24730382598916, 27.63048841671455],
              [84.24520097412149, 27.629233711694052]]]),
        {
          "label": "narayani",
          "system:index": "0"
        });

/*
   This function masks clouds and cirrus in Sentinel-2 images using the QA band.
   It takes an image as input and returns the image with clouds and cirrus masked.
*/
function maskS2clouds(image) {
  // Selecting the Quality Assessment (QA) band from the input image
  var qa = image.select('QA60');

  // Defining the bit masks for clouds and cirrus
  var cloudBitMask = 1 << 10; // Bit 10 represents clouds
  var cirrusBitMask = 1 << 11; // Bit 11 represents cirrus clouds

  /*
     Creating a mask where both cloud and cirrus bits are set to zero,
     indicating clear conditions. This is achieved by performing bitwise operations
     and equality checks on the QA band.
  */
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
             .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  // Updating the image mask and scaling by 10000 to get reflectance values
  return image.updateMask(mask).divide(10000);
}

// Filtering Sentinel-2 images by date, location, and cloud cover percentage
var s2MSI = ee.ImageCollection("COPERNICUS/S2_SR")
            .filterDate('2022-01-01','2023-03-03') // Filtering images by date range
            .filterBounds(roi) // Filtering images by a region of interest
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20)) // Filtering images by cloud cover percentage
            .map(maskS2clouds); // Applying the cloud masking function to each image

// Creating a median composite of the filtered images
var imgS2 = s2MSI.median();

// Visualization parameters for displaying RGB image
var visualization = {min:0, max:0.3, bands:['B4','B3','B2']};

// Adding the RGB image layer to the map
Map.addLayer(imgS2,visualization, 'RGB');

// Selecting the B4 band from the composite image
var s2B4= imgS2.select('B4');

// Retrieving the nominal scale (resolution) of the B4 band
var resolutionB4 = s2B4.projection().nominalScale();
print(resolutionB4);

// Selecting bands of interest for spectral response curve analysis
var subsetS2 = imgS2.select('B2','B3','B4','B5','B6','B7','B8','B8A','B9','B11','B12');

// Defining regions of interest for spectral response curve analysis
var samples = ee.FeatureCollection([water,forest]); // FeatureCollection of regions (e.g., water, forest)

/*
   Creating a scatter chart of mean reflectance for each band.
   It uses the 'regions' method to calculate the mean reflectance for each band
   within the specified regions of interest.
*/
var imgS2PointChart = ui.Chart.image.regions(subsetS2, samples, ee.Reducer.mean(), 10, 'label')
                    .setChartType('ScatterChart');
                    
print(imgS2PointChart);

// Customizing scatter chart options for better readability
var plotOptions = {
  title:'S2 Reflectance Curve',
  hAxis: {title:'Wavelength (nanometers)'},
  vAxis:{title: 'reflectance (%)'},
  lineWidth: 1,
  pointSize:4,
  series:{
    0:{color:'blue'}, // Representing water
    1:{color:'green'} // Representing forest
  }
};

// Defining wavelengths for each band
var wavelengths = [490, 560, 665, 705, 740, 783, 590, 865, 945, 1610, 2190];

/*
   Creating scatter chart with customized options and defined wavelengths.
   It uses the 'regions' method to calculate the mean reflectance for each band
   within the specified regions of interest, and plots the results as a scatter chart.
*/
var imgS2ScatChart = ui.Chart.image.regions(subsetS2, samples, ee.Reducer.mean(), 10, 'label', wavelengths)
                    .setChartType('ScatterChart')
                    .setOptions(plotOptions);

print(imgS2ScatChart);

//Now checking the water in the ponds of Kathmandu Valley and rivers along with river outside the valley

// Defining regions of interest for spectral response curve analysis
var samplesWater = ee.FeatureCollection([ranipokhari,siddhapokhari,manohara,narayani]); // FeatureCollection of regions


var plotOptionsWater = {
  title:'S2 Reflectance Curve',
  hAxis: {title:'Wavelength (nanometers)'},
  vAxis:{title: 'reflectance (%)'},
  lineWidth: 1,
  pointSize:4,
  series:{
    0:{color:'blue'}, // Representing ranipokhari
    1:{color:'green'}, // Representing siddhapokhari
    2:{color:'red'}, // Representing manohara
    3:{color:'purple'} // Representing narani
  }
};

// Defining wavelengths for each band
var wavelengths = [490, 560, 665, 705, 740, 783, 590, 865, 945, 1610, 2190];

/*
   Creating scatter chart with customized options and defined wavelengths.
   It uses the 'regions' method to calculate the mean reflectance for each band
   within the specified regions of interest, and plots the results as a scatter chart.
*/
var imgS2ScatChart = ui.Chart.image.regions(subsetS2, samplesWater, ee.Reducer.mean(), 10, 'label', wavelengths)
                    .setChartType('ScatterChart')
                    .setOptions(plotOptionsWater);
                    
//Now analyse yourself why the water from different sources have different spectral properties
print(imgS2ScatChart);