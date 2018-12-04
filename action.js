var play=0,
    timer=0,
    curslider=0,
    days=[],
    datageojson=0,
    ALLDATA = 0,
    gv_data = 0,
    THECIRCLE = [],
    adm2="geojson/phl_bnd_adm1province_marawi-mapsharper-v7.geojson";

var widthOfScreen = $('body').width();
    console.log(widthOfScreen);
    var zoommap = 6.9;
    if(widthOfScreen < 1650){
      zoommap = 6.9;
    }else{
      zoommap = 7.0;
    }
    var map = L.map('map',{renderer: L.svg(),  zoomControl:false, attributionControl: false,zoomSnap: 0.1} ).setView([8.179721, 125.974017], zoommap);

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();


    var rtime;
    var timeout = false;
    var delta = 1500;
    $(window).resize(function() {
        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(resizeend, delta);
        }
    });

    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            timeout = false;
            location.reload();
        }               
    }

    $(document).on('mousemove', function(e){
        $('#tooltip').css({
           left:  e.pageX +20,
           top:   e.pageY - 30
        });
    });

function removestripdate(string){
    string = string.replace('-','.');
    string = string.replace('-','.');
    string = string.replace('/','.');
    string = string.replace('/','.');
    return string;
}
function changedotdate(string){
    string = string.replace('.','-');
    string = string.replace('.','-');
    return string;
}

function call_slider(){
  // SLIDER
  $("#theslider")
    .slider({ 
        min: 0, 
        max: days.length-1, 
        value: 0 
    })
    // add pips with the labels set to "months"
    .slider("pips", {
        rest: "label",
        labels: days
    })
    // and whenever the slider changes, lets echo out the month
    .on("slidechange", function(e,ui) {
        curslider = ui.value;
        slidermove(ui.value);
        update(changedotdate(days[curslider]));    
    });
  // END SLIDER


  // SLIDER PLAY
  function slidermove(val){
    draw_circle(days[val]);
  }

  function theplay(){
    curslider += 1;
    $( "#theslider" ).slider({
      value: curslider
    });
    
    timer = setInterval(function(){
      curslider += 1;
      $( "#theslider" ).slider({
        value: curslider
      });
    },1500);
  }


  $('#playstop').on('click',function(){
    if(curslider == days.length-1){
      curslider = -1;
    }
    if(play){
      play = 0;
      $('#playstop').attr('class','fas fa-play-circle');
      clearInterval(timer);
    }else{
      play = 1;
      $('#playstop').attr('class','fas fa-pause-circle');            
      theplay();
    }
  })
  // END SLIDER PLAY
}


function call_choropleth(){
  d3.json(adm2,function(data){
      datageojson = data;
      drawchoro();

      function drawchoro(){
        var info = L.control();

        info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info');
          this.update();
          return this._div;
        };

        info.update = function (props) {
          if(props){
            $('#tooltip').show();
            // $('#tooltip').html(props.LLGNAME);
            $('#tooltip').html(props.ADM1_EN);
          }else{
            $('#tooltip').hide();
          }
          
        };

        info.addTo(map);

        var curlayer = 0;
        function style(feature) {
          return {
            weight: 1,
            opacity: 1,
            color: '#32BEF2',
            // color: '#607d8b',
            dashArray: '1.5',
            fillOpacity: 0,
            fillColor: '#282848'
          };
        }

        function highlightFeature(e) {
          var layer = e.target;

          layer.setStyle({
            weight: 1.5,
            color: '#fff',
            dashArray: '1',
            opacity: 1
          });

          curlayer = layer;
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }

          info.update(layer.feature.properties);
        }

        

        function resetHighlight(e) {
          geojson.resetStyle(e.target);
          info.update();
          curlayer.bringToBack();
        }

        function zoomToFeature(e) {
          // map.fitBounds(e.target.getBounds());
        }

        function onEachFeature(feature, layer) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            // click: zoomToFeature
          });
        }

        geojson = L.geoJson(datageojson, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);
      }
    })

    L.grid().addTo(map);
}


function draw_circle(datesel){
  THECIRCLE.forEach(function(d){
    if(map.hasLayer(d)){
      map.removeLayer(d);
    }
  })
  THECIRCLE = [];
  ALLDATA.forEach(function(d){
    theday = removestripdate(d['Reporting Period']);
    if(theday == datesel){
      if(d['No. of returned'] != 0 && d['No. of returned'] != '' && d['No. of returned'] != null){
        THECIRCLE.push(L.circle([d.y, d.x], {
          radius: d['No. of returned'],
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.4,
          weight: 0.5,

        }).addTo(map));
      }
    }
  })
}

d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vRfX4nyPkHGGfM2iTBCCKdwE-vrpoMWH4TmZwnbzB3gGoup-5x3Y9pmnfDk5i1Tq9EIrj9A9uIKGJrI/pub?gid=0&single=true&output=csv',function(data){
  ALLDATA = data;
  data.forEach(function(d){
    
    theday = removestripdate(d['Reporting Period']);

    if(jQuery.inArray( theday, days ) == -1){
      days.push(theday);
    }
  })
  console.log(days);
  call_slider();
  call_choropleth();
  draw_circle(days[0]);
  $('#loadingdata').hide();
})




  var tilesPerRow = 10;
  var barPadding = 70;
  var tileSize = 0;
  var labelFontSize = "12px";

  if(widthOfScreen < 1400){
    barPadding = 50;
    tileSize = 9;
    labelFontSize = "11px";
  }
  else if(widthOfScreen < 1600){
    barPadding = 50;
    tileSize = 9;
  }else{
    barPadding = 50;
    tileSize = 9;
    d3.select('.vis1legend').attr("transform",'translate(15,20)');
    d3.select('.vis2legend').attr("transform",'translate(15,20)');
    d3.select('.vis3legend').attr("transform",'translate(15,20)');
    $('.total_mobility').css('left','5rem');
  }

  var barWidth = (tilesPerRow * tileSize) + barPadding;

  var filteredData=[];
  var colors1 = ["#CAE5FF"];
  var colors2 = ["#CAE5FF"];
  var colors3 = ['#CAE5FF'];

  var selecteddate = '', selectedMode = "top10";
  var cluscall = 1;




  var clus1 = ['VI','VII','IX'];
  var clus2 = ['X','XI','XII'];
  var clus3 = ['CARAGA','ARMM','Others'];

  function initializeData() {
    gv_data = gv_data.map(function(d) {
      return {
        name: d['Region'],
        textdate: d['Reporting Period'],
        nilai: +(d['No. of returned'])
      }
    });
  }

  function updateFilteredData() {
    filteredData[1] = gv_data.filter(function(d) {
      return d.textdate == selecteddate && clus1.includes(d['name']);
    });
    filteredData[2] = gv_data.filter(function(d) {
      return d.textdate == selecteddate && clus2.includes(d['name']);
    });
    filteredData[3] = gv_data.filter(function(d) {
      return d.textdate == selecteddate && clus3.includes(d['name']);
    });
    console.log(filteredData);
  }

  function getTiles(num) {
    var tiles = [];

    for(var i = 0; i < num; i++) {
      var rowNumber = Math.floor(i / tilesPerRow);
      tiles.push({
        x: (i % tilesPerRow) * tileSize,
        y: -(rowNumber + 1) * tileSize
      });
    }
    return tiles
  }

  function updateBar(d, i) {
    if(clus1.includes(d['name'])){
      cluscall = $('#thesvgtotalmobility').height() / 4.3;
      d3.select('.leg1').attr("transform",'translate(0,'+ ($('#thesvgtotalmobility').height() / 4.3)/2 +')');
      var tiles = getTiles(d.nilai / 250);
      var clasnm = 'rect1';
    }
    if(clus2.includes(d['name'])){
      cluscall = $('#thesvgtotalmobility').height() / 1.9;
      d3.select('.leg2').attr("transform",'translate(0,'+ ($('#thesvgtotalmobility').height() / 2.4) +')');
      var tiles = getTiles(d.nilai/250);
      var clasnm = 'rect2';
    }
    if(clus3.includes(d['name'])){
      cluscall = $('#thesvgtotalmobility').height() / 1.15;
      d3.select('.leg3').attr("transform",'translate(0,'+ ($('#thesvgtotalmobility').height() / 1.35) +')');
      var tiles = getTiles(d.nilai/250);
      var clasnm = 'rect3';
    }
    
    var u = d3.select(this)
      .attr("transform", "translate(" + i * barWidth + ","+cluscall+")")
      .selectAll("rect")
      .data(tiles);

    u.enter()
      .append("rect")
      .style("opacity", 0)
      .style("stroke", "black")
      .style("stroke-width", "1")
      .style("shape-rendering", "crispEdges")
      .merge(u)
      .attr("x", function(d) {
        return d.x;
      })
      .attr('class',clasnm)
      .attr("y", function(d) {
        return d.y;
      })
      .attr("width", tileSize)
      .attr("height", tileSize)
      .transition()
      .delay(function(d, i) {
        return i * 5;
      })
      .style("opacity", 1);


    u.exit()
      .transition()
      .delay(function(d, i) {
        return (250 - i) * 5;
      })
      .style("opacity", 0)
      .on("end", function() {
        d3.select(this).remove();
      });
  }

  function updateLabel(d) {
    var el = d3.select(this)
      .select("text");

    if(el.empty()) {
      el = d3.select(this)
        .append("text")
        .attr("y", -4)
        .attr("transform", "rotate(-90)")
        .style("font-weight", "")
        .style("font-size", labelFontSize)
        .style("fill", "#00bcd4");
    }

    el.text(d.name);

    var thenilai = d3.select(this)
                  .select("text");

    thenilai = d3.select(this)
        .append("text")
        .attr("y", 10)
        // .attr("transform", "rotate(-90)")
        .style("font-weight", "")
        .style("font-size", "10px")
        .style("fill", "#fff")
        .attr('class','textnilai');

    thenilai.text(d.nilai);
  }

  function updateBars(num) {
    var u = d3.select("g#vis"+num)
      .selectAll("g")
      .data(filteredData[num]);

    u.enter()
      .append("g")
      .merge(u)
      .style("fill", function(d, i) {
        // if(num == 1){
        //   return colors1[i % colors1.length];
        // }
        // else if(num == 2){
        //   return colors2[i % colors2.length];
        // }
        // else if(num == 3){
        //   return colors3[i % colors3.length];
        // }
        return '#CAE5FF'
        
      })
      .each(updateBar)
      .each(updateLabel);

    u.exit().remove();
  }

  function initialize() {
    initializeData();

    d3.select("select.mode")
      .on("change", function() {
        selectedMode = this.value;
        update();
      })

    d3.select("select.date")
      .on("change", function() {
        selecteddate = +this.value;
        update();
      });
  }

  function update(datetext) {
    $('.textnilai').remove('');
    selecteddate = datetext;
    updateFilteredData();
    updateBars(1);
    updateBars(2);
    updateBars(3);
  }

  d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRfX4nyPkHGGfM2iTBCCKdwE-vrpoMWH4TmZwnbzB3gGoup-5x3Y9pmnfDk5i1Tq9EIrj9A9uIKGJrI/pub?gid=0&single=true&output=csv", function(err, csv) {
    gv_data = csv;
    initialize();
    update(changedotdate(days[0]));
    d3.select('g.chart').attr('transform','translate(10, 0)');
  });






