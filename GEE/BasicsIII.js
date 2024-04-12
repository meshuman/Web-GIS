var geometry = /* color: #98ff00 */ee.Geometry.Point([85.38000532515339, 27.677231632811175]),
    roi = 
    /* color: #0b4a8b */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[85.29721688502127, 27.7842161616074],
          [85.29721688502127, 27.58767066412301],
          [85.53840111964041, 27.58767066412301],
          [85.53840111964041, 27.7842161616074]]], null, false),
    roi2 = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[85.41326225911207, 27.724406215346374],
          [85.41326225911207, 27.641711983655753],
          [85.50389946614332, 27.641711983655753],
          [85.50389946614332, 27.724406215346374]]], null, false);


// Set the date range for the Sentinel-2 data
var startDate = '2021-01-01';
var endDate = '2022-01-01';

// Function to compute and display histogram
function displayHistogram(image, band, region) {
  var histogram = ui.Chart.image.histogram({
    image: image.select(band),
    region: region,
    scale: 30,
    maxBuckets: 100,
    maxPixels: 1e9
  });
  print(histogram);
}

// Get Sentinel-2 data within the ROI and date range
var S2_data = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(roi)
  .filterDate(startDate, endDate);
  
var s2Img = S2_data.first();

Map.centerObject(s2Img,9);
// Display original image
Map.addLayer(s2Img, {min: 0, max: 4000, bands: ['B4', 'B3', 'B2']}, 'Original Image');

// Display histograms of original image bands
displayHistogram(s2Img, 'B8', roi);
displayHistogram(s2Img, 'B4', roi);
displayHistogram(s2Img, 'B3', roi);

// // Perform histogram stretching
var stretchedImg = s2Img.multiply(255.0 / 2500.0); // Stretch to 8-bit dynamic range (0-255)
Map.addLayer(stretchedImg, {bands: ['B4', 'B3', 'B2'], min: 0, max: 255}, 'Stretched Image');
displayHistogram(stretchedImg, 'B4', roi);

// Perform histogram equalization
var equalizedImg = s2Img.unitScale(0, 2000).multiply(255).uint8();
Map.addLayer(equalizedImg, {min:0, max:255, bands:['B4','B3','B2']}, 'Equalized Image');
displayHistogram(equalizedImg, 'B4', roi);
displayHistogram(equalizedImg, 'B3', roi);

// Define piece-wise linear enhancement functions
var linear1 = function(image) {
  return image.expression('b(0) * 2.5', {'b': image});
};

var linear2 = function(image) {
  return image.expression('(b(0) - 1000) * 1.5 + 2500', {'b': image});
};

var linear3 = function(image) {
  return image.expression('(b(0) - 2000) * 1.5 + 4000', {'b': image});
};

// Define the logarithmic enhancement function
var logEnhancement = function(image) {
  return image.log().multiply(255 / Math.log(3000));
};

// Apply piece-wise linear enhancement
var pieceEnhancedImg = s2Img.where(s2Img.lt(1000), linear1(s2Img))
                          .where(s2Img.gte(1000).and(s2Img.lt(2000)), linear2(s2Img))
                          .where(s2Img.gte(2000), linear3(s2Img));
Map.addLayer(pieceEnhancedImg, {bands: ['B4', 'B3', 'B2'], min: 0, max: 255}, 'Piecewise Enhanced');

// Apply logarithmic enhancement
var enhancedLogImage = logEnhancement(s2Img);
displayHistogram(enhancedLogImage, 'B4', roi);
Map.addLayer(enhancedLogImage, {bands: ['B4', 'B3', 'B2'], min: 0, max: 255}, 'Logarithmic Enhanced');

// Calculate NDBI (Normalized Difference Built-Up Index)
var ndbi = s2Img.normalizedDifference(['B11', 'B8']); // Adjust bands according to your data
print(ndbi);

// Compute minimum and maximum values of NDBI within the region of interest
var ndbiRange = ndbi.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: roi,
  scale: 30,
  maxPixels: 1e9
});

print(ndbiRange);
displayHistogram(ndbi, 'nd', roi);

// Get minimum and maximum values from the computed range
var ndbiMin = ndbiRange.get('nd_min');
var ndbiMax = ndbiRange.get('nd_max');

// Print the range of NDBI values
print('NDBI Minimum Value:', ndbiMin);
print('NDBI Maximum Value:', ndbiMax);

Map.addLayer(ndbi,{},'NDBI');

// Threshold NDBI to identify urban areas
var urbanMask = ndbi.gt(-0.94); // Adjust threshold value as needed

// Mask the original image with the urban areas
var urbanAreas = s2Img.updateMask(urbanMask);

print(urbanAreas, 'Urban Areas');

Map.addLayer(urbanAreas,{},'Urban Areas');


// Compute statistics or properties of the masked urban areas within the ROI
var urbanStats = urbanAreas.reduceRegion({
  reducer: ee.Reducer.mean(), // You can use other reducers like ee.Reducer.minMax(), ee.Reducer.median(), etc.
  geometry: roi,
  scale: 30, // Adjust scale as needed
  maxPixels: 1e9
});

// Print the computed statistics or properties
print('Urban Area Statistics:', urbanStats);


