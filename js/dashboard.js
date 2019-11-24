const DB_COLOR = '#474f5c';
const DB_CLUSTER_COLORS = ['#db9f1d', '#0193bd', '#129793', '#374749'];
const DB_NEIGHBORHOOD_COLORS = ['#bbe7d2', '#83b0a6', '#374749', '#3d9674', '#182f2d',
                                '#3999a1', '#4fc5e7', '#aafff9', '#4f8fbf', '#073749',
                                '#fa7268', '#eb5757', '#e61e50', '#e01e5a', '#e53974',
                                '#f2ce76', '#ecbb45', '#bf9d34', '#a97524', '#a15421',
                                '#004c97', '#ff9e15', '#e61e50', '#4cb04f', '#00bcd4']
const DB_NEIGHBORHOOD_LIST = ['CollgCr', 'Veenker', 'NoRidge', 'Mitchel', 'Somerst', 'NWAmes',
                               'BrkSide', 'Sawyer', 'NAmes', 'SawyerW', 'IDOTRR', 'MeadowV',
                               'NridgHt', 'Timber', 'Gilbert', 'OldTown', 'ClearCr', 'Crawfor',
                               'Edwards', 'NPkVill', 'StoneBr', 'BrDale', 'Blmngtn', 'SWISU',
                               'Blueste']
const DB_SCATTER_LIST = ['PC1', 'PC2', 'GrLivArea', 'SalePrice', 'YearBuilt', 'MDS1', 'MDS2'];
const DB_DOMAINS = {};
const DB_CLUSTER_SELECTION = [true, true, true, true];
const DB_MIN_WIDTH = 1000;

var clusterFilter = 'Agglomerative';
var barchartSingleColor = true;

var allFilter = {};

function resetFilter() {
  for (var i = 1; i <= 4; i++) {
    DB_CLUSTER_SELECTION[i - 1] = true;
    document.getElementById('clusterSelection' + i).checked = true;
  }
  clusterFilter = 'Agglomerative';
  barchartSingleColor = true;
  allFilter = {};
  resetNeighborhood();
  resetOverallQual();
  resetOverallCond();
  resetScatter();
  db_clusterFilterChanges();
}

function resetNeighborhood() {
  allFilter['Neighborhood'] = new Set();
  for (var i = 0; i < DB_NEIGHBORHOOD_LIST.length; i++) {
    allFilter['Neighborhood'].add(DB_NEIGHBORHOOD_LIST[i]);
  }
}

function resetOverallQual() {
  allFilter['OverallQual'] = new Set();
  for (var i = 1; i <= 10; i++) {
    allFilter['OverallQual'].add("" + (i));
  }
}

function resetOverallCond() {
  allFilter['OverallCond'] = new Set();
  for (var i = 1; i <= 10; i++) {
    allFilter['OverallCond'].add("" + (i));
  }
}

function resetScatter() {
  allFilter['GrLivArea'] = null;
  allFilter['SalePrice'] = null;
  allFilter['PC1'] = null;
  allFilter['PC2'] = null;
  allFilter['MDS1'] = null;
  allFilter['MDS2'] = null;
}

function applyFilter() {
  db_scatter1();
  db_scatter2();
  db_scatter3(document.getElementById('pcaOrMDS_mds').checked);
  if (clusterFilter === 'Neighborhood') {
    db_barchartSingleColorChanges(false);
  } else {
    db_barchartSingleColorChanges(true);
  }
}

function db_clusterFilterChanges() {
  clusterFilter = 'None';
  for (var i = 1; i <= 6; i++) {
    var id = 'clusterFilter' + i;
    if (document.getElementById(id).checked) {
      clusterFilter = document.getElementById(id).value;
    }
  }
  if (clusterFilter == 'Agglomerative' || clusterFilter == 'KMeans') {
    document.getElementById('clusterSelectionSection').style.display = 'block';
    for (var i = 1; i <= 4; i++) {
      document.getElementById('l_clusterSelection' + i).style.color = DB_CLUSTER_COLORS[i - 1];
      document.getElementById('l_clusterSelection' + i).style.backgroundColor = DB_CLUSTER_COLORS[i - 1];
    }
  } else {
    document.getElementById('clusterSelectionSection').style.display = 'none';
  }
  applyFilter();
}

function db_clusterSelectionChanges() {
  for (var i = 1; i <= 4; i++) {
    DB_CLUSTER_SELECTION[i - 1] = document.getElementById('clusterSelection' + i).checked;
  }
  applyFilter();
}

function db_clusterSelectionChangesAll(val) {
  for (var i = 1; i <= 4; i++) {
    DB_CLUSTER_SELECTION[i - 1] = val;
    document.getElementById('clusterSelection' + i).checked = val;
  }
  applyFilter();
}

function db_barchartSingleColorChanges(value) {
  barchartSingleColor = value
  db_barchart1();
  db_barchart2(document.getElementById('overallQualOrOverallCond_c').checked);
}
