Ext.define('Application.components.categoryStatsGrid', {
  extend: 'Ext.Panel',
  border: false,
  col: {
    width: {
      count: 120,
      sum: 120
    }
  },

  initComponent: function() {

    Application.components.categoryStatsGrid.superclass.initComponent.call(this);

    var store = this.getStore();
    store.on('beforeload', function() {
      this.getEl().mask();
    }, this);
    store.on('load', function() {
      this.add(this.getGrid(store));
      this.doLayout();
      this.getEl().unmask();
    }, this);

  },

  actionHandler: function(code) {
    redirect_to('tsn/procedure/index/code/' + code);
  },

  getGrid: function(store, element, child) {
    var expander = this.getExpander(store);
    var okpWidth = this.getWidth() - expander.width - this.col.width.count - this.col.width.sum - (child ? 2 : 0);
    var columns = [];
    if (!child)
      columns.push(expander);
    columns.push({header: 'Категория классификатора', dataIndex: 'okp', width: okpWidth});
    columns.push({header: 'Количество торгов, шт.', dataIndex: 'count', width: this.col.width.count});
    columns.push({header: 'Объем торгов', dataIndex: 'sum', width: this.col.width.sum,
      renderer: Ext.util.Format.formatPrice});

    var grid = new Ext.grid.GridPanel({
      store: store,
      autoHeight: true,
      border: false,
      disableSelection: true,
      trackMouseOver: child || false,
      /*hideHeaders: child || false,*/
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          menuDisabled: true,
          sortable: false,
          resizable: false
        },
        columns: columns
      }),
      plugins: expander
    });
    grid.on('rowclick', function(grid, rowIndex) {
      var code = store.getAt(rowIndex).get('code');
      if (child || code == '0')
        this.actionHandler(code);
    }, this);
    element && grid.render(element);
    return grid;
  },

  getExpander: function(store) {
    var component = this;
    return new Ext.ux.grid.GridRow({
      tpl: '<div class="ux-row-expander-box"></div>',
      actAsTree: true,
      treeLeafProperty: 'is_leaf',
      listeners: {
        expand: function(expander, record, body, rowIndex) {
          component.getGrid(new Ext.data.ArrayStore({
            idIndex: 2,
            fields: Ext.data.Record.create([
              {name: 'okp', mapping: 'okp'},
              {name: 'sum', mapping: 'sum'},
              {name: 'code', mapping: 'code'},
              {name: 'count', mapping: 'count'},
              {name: 'is_leaf', mapping: 'is_leaf'}
            ]),
            data: store.getAt(rowIndex).get('items')
          }), Ext.get(this.grid.getView().getRow(rowIndex)).child('.ux-row-expander-box'), true);
        }
      }
    });
  },

  getStore: function() {
    return new Ext.data.DirectStore({
      directFn: RPC_tsn.Procedure.stats,
      root: 'rows',
      totalProperty: 'totalCount',
      autoDestroy: true,
      autoLoad: true,
      autoSave: false,
      fields: ['code', 'okp', 'count', 'sum', 'is_leaf', 'items']
    });
  }
})
;