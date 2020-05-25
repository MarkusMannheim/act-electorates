const d3 = require("d3"),
      fs = require("fs");

console.log("reading suburbs ...");
fs.readFile("divisions.geojson", "utf8", function(error, data) {
  if (error) throw error;
  divisions = JSON.parse(data).features;

  console.log("filtering and formatting ACT suburbs ...");
  divisions = divisions
    .map(function(d) {
      let name = d.properties.DIVISION_NAME.split(" ");
      let newName = []
      name.forEach(function(e) {
        newName.push(e.slice(0, 1) + e.slice(1).toLowerCase());
      });
      newName = newName.join(" ");
      d.properties = {
        suburb: newName
      };
      return d;
    });

  suburbs = divisions
    .map(function(d) {
      return d.properties.suburb;
    });

  console.log("reading and filtering Australian suburbs ...");
  fs.readFile("suburbsAustralia.geojson", "utf8", function(error, data) {
    if (error) throw error;
    divisions = JSON.parse(data)
      .features
      .filter(function(d) {
        return suburbs.includes(d.properties.SSC_NAME16.replace(" (ACT)", "")) && d.properties.STE_CODE16 == "8";
      })
      .map(function(d) {
        d.properties = {
          suburb: d.properties.SSC_NAME16.replace(" (ACT)", "")
        }
        return d;
      });

    divisions = {
      type: "FeatureCollection",
      features: divisions
    };

    fs.writeFile("../suburbs.geojson", JSON.stringify(divisions), function(error) {
      console.log("suburbs.geojson written");
    });
  });
});
