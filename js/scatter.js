
const SCATTER_ATTRIBUTES = ['LotFrontage', 'LotArea', 'YearBuilt', 'MasVnrArea', 'OverallCond', 'TotalBsmtSF', 'GrLivArea', 'GarageArea', 'PoolArea', 'SalePrice'];

function setUpDropdown_scatter() {
  var select = document.getElementById('scatter-attribute-1');
  var e = document.getElementById('scatter-dropdown-1');
  var i = 0
  for (; i < SCATTER_ATTRIBUTES.length; i++) {
    var name = SCATTER_ATTRIBUTES[i];
    if (SCATTER_ATTRIBUTES[i] == 'LotArea') {
      select.innerHTML += "<option value=\""+ name + "\" selected>" + name + "</option>"
    } else {
      select.innerHTML += "<option value=\""+ name+ "\">" + name + "</option>"
    }
    e.innerHTML += "<div class=\"dropdown-content\"><a onclick =\"\">" + name + "</a></div>";
  }

  select = document.getElementById('scatter-attribute-2');
  e = document.getElementById('scatter-dropdown-2');
  i = 0
  for (; i < SCATTER_ATTRIBUTES.length; i++) {
    var name = SCATTER_ATTRIBUTES[i];
    if (SCATTER_ATTRIBUTES[i] == 'SalePrice') {
      select.innerHTML += "<option value=\""+ name + "\" selected>" + name + "</option>"
    } else {
      select.innerHTML += "<option value=\""+ name+ "\">" + name + "</option>"
    }
    e.innerHTML += "<div class=\"dropdown-content\"><a onclick =\"\">" + name + "</a></div>";
  }
}
