

Ext.ns('Ext.ux.helpers');

Ext.ux.helpers.textEdit = function(){return new Ext.form.TextField();};
Ext.ux.helpers.timeEdit = function() {return new Ext.form.TimeField({increment: 30, format: 'H:i'});};

Ext.ux.helpers.numberEdit = function(){return new Ext.form.NumberField({
    allowNegative: false,
    allowDecimals: false
  });
};
Ext.ux.helpers.dateEdit = function(){return new Application.components.dateField({
  format: 'd.m.Y',
  altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i'
});
};

Ext.ux.helpers.dateTimeEdit = function(){return new Application.components.dateField({
  format: 'd.m.Y H:i',
  altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i'
});
};

function redirectActionHandler(location, confirm) {
  var template = new Ext.Template(location);
  if (confirm) {
    confirm = new Ext.Template(confirm);
  }
  return function(grid, rowIndex) {
    if (!grid.getAt && grid.getStore) {
      grid = grid.getStore();
    }
    var item = grid.getAt(rowIndex);
    if (item) {
      var location = template.apply(item.data);
      if (confirm) {
        Ext.Msg.confirm('Подтверждение', confirm.apply(item.data), function(r) {
          if ('yes'==r) {
            redirect_to(location);
          }
        });
      } else {
        redirect_to(location);
      }
    }
  }
}

function hrefAction(location) {
  var template = new Ext.Template(location);
  return function(v, m, r) {
    var location = template.apply(r.data);
    return href_to(location);
  }
}
