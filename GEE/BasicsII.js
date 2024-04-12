var geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[85.34931640624998, 27.680194113141756],
          [85.34931640624998, 27.65039501942878],
          [85.40733795166014, 27.65039501942878],
          [85.40733795166014, 27.680194113141756]]], null, false),
    roi = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[85.34433106945093, 27.674204439933447],
          [85.34433106945093, 27.670403778858173],
          [85.34965257213648, 27.670403778858173],
          [85.34965257213648, 27.674204439933447]]], null, false);

// Load Sentinel-2 Level-2A image collection
var sentinel2Collection = ee.ImageCollection('COPERNICUS/S2_SR')
                          .filterDate('2021-01-01', '2021-01-31')
                          .filterBounds(geometry); // Define your region of interest using a geometry

// Define a function to apply radiometric calibration
var applyRadiometricCalibration = function(image) {
  // Define the coefficients for converting Digital Number (DN) to TOA reflectance
  var coefficients = ee.Image.constant([0.0001]).multiply(10);
  
  // Apply the calibration equation: reflectance = DN * scale_factor
  var calibratedImage = image.multiply(coefficients);
  
  // Return the calibrated image
  return calibratedImage;
};

// Apply radiometric calibration to the image collection
var calibratedCollection = sentinel2Collection.map(function(image) {
  return applyRadiometricCalibration(image);
});

// Select a single calibrated image from the collection for visualization
var calibratedImage = calibratedCollection.first();

// Calculate the minimum and maximum values of the calibrated image
//this will help to set the minimum and max values in the visualization paramters

// Define the reduction with percentile calculation
var reduction = ee.Reducer.minMax().combine({
  reducer2: ee.Reducer.percentile([5, 95]),
  sharedInputs: true
}).combine({
  reducer2: ee.Reducer.stdDev(),
  sharedInputs: true
});

var stats = calibratedImage.reduceRegion({
  reducer: reduction,
  geometry: geometry,
  scale: 10
});

print(stats);
var rangeDict = ee.Dictionary({
  // Extract minimum, maximum, and standard deviation values
  minVal: stats.getNumber('B4_min'),
  maxVal: stats.getNumber('B4_max'),
  stdDevVal: stats.getNumber('B4_stdDev'),
  percentile5:stats.getNumber('B4_p5'),
  percentile95: stats.getNumber('B4_p95')
});

// Visualize the calibrated image with adjusted min-max values
Map.addLayer(calibratedImage, {bands:['B4', 'B3', 'B2'], min:rangeDict.minVal, max:rangeDict.maxVal}, 'Calibrated Image');
Map.centerObject(calibratedImage, 10);

// Display the map
Map.addLayer(sentinel2Collection.first(), {bands:['B4', 'B3', 'B2'], min:0, max:3000}, 'Original Image');

//Now let's understand the image from the histogram

var imgForHist = sentinel2Collection.first()
var hisComposite = imgForHist.select(['B4','B3','B2']);

// Generate a histogram of pixel values for the composite image
var histogram = ui.Chart.image.histogram({
  image: imgForHist.select('B4'),
  region: roi,
  scale: 10,
  maxBuckets: 10000
}).setOptions({
  title: 'Histogram of RGB Composite',
  hAxis: {title: 'Pixel Value'},
  vAxis: {title: 'Frequency'}
});

// Display the histogram
print(histogram);
