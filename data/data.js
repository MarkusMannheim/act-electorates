const d3 = require("d3"),
      fs = require("fs");

console.log("reading electorate boundaries ...");
fs.readFile("actElectorates.geojson", "utf8", function(error, data) {
  if (error) throw error;
  electorates = JSON.parse(data).features;

  console.log("converting electorate boundaries ...");
  // reformat data
  electorates.forEach(function(d) {
    d.properties = { electorate: d.properties.ELECTORATE.toLowerCase() };
  });

  // reformat into GeoJSON
  electorates = {
    type: "FeatureCollection",
    features: electorates
  };

  // save reformatted data
  fs.writeFile("electorates.geojson", JSON.stringify(electorates), function(error) {
    console.log("electorates.geojson written");
  });

  console.log("reading SA1 boundaries ...");
  fs.readFile("sa1sAustralia.geojson", "utf8", function(error, data) {
    if (error) throw error;
    sa1s = JSON.parse(data).features;

    console.log("converting SA1 boundaries ...");
    // filtering
    sa1s = sa1s
      .filter(function(d) { return d.properties.STE_CODE16 == "8" && +d.properties.AREASQKM16 > 0; });

    // reformat data
    sa1s.forEach(function(d) {
      d.properties = {
        sa1: d.properties.SA1_MAIN16,
        dig7: d.properties.SA1_7DIG16
      };
    });

    // reformat into GeoJSON
    sa1s = {
      type: "FeatureCollection",
      features: sa1s
    };

    // sort into electorates
    console.log("sorting into electorates ...");
    sa1s.features
      .forEach(function(d) {
        let i = 0;
        while (i < electorates.features.length) {
          if (d3.geoContains(electorates.features[i], d3.geoCentroid(d))) {
            d.properties.electorate = electorates.features[i].properties.electorate;
            console.log(d.properties.dig7 + " in " + d.properties.electorate);
            break;
          }
          i++;
        }
      });

    // save reformatted data
    fs.writeFile("sa1s.geojson", JSON.stringify(sa1s), function(error) {
      console.log("sa1s.geojson written");
    });

    areas = sa1s
      .features
      .map(function(d) {
        return {
          area: d.properties.dig7,
          electorate: d.properties.electorate
        };
      });

    fs.writeFile("areas.csv", d3.csvFormat(areas, ["area", "electorate"]), function(error) {
      console.log("areas.csv written");
    });
  });
});
