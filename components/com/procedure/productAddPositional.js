Ext.define('Application.components.productAddPositional', {
  extend: 'Ext.form.FieldSet',
  initComponent: function() {

    this.products_panel = new Ext.Panel({
      items: []
    });

    Ext.apply(this, {
      title: 'Добавить закупочные позиции',
      anchor: '100%',
      defaults: {
        border: true
      },
      items: [
        this.products_panel
      ],
      bodyCssClass: 'subpanel',
      bodyStyle: 'padding-top: 0;',
      style: 'padding-bottom: 0;',
      buttons: [
        {
          text: 'Добавить закупочную позицию',
          scope: this,
          handler: function() {
            this.addProduct();
          }
        },
        {
          text: 'Загрузить закупочные позиции в формате CSV',
          scope: this,
          handler: function() {
          }
        }
      ],
      listeners: {
        scope: this,
        productremove: function(p) {
          this.removeProductsItem(p);
          this.doLayout();
        }
      }
    });

    Application.components.productList.superclass.initComponent.call(this);
  },

  addProduct: function(value, nolayout) {
    var insertProduct = function() {
      var p = new Application.components.productPositionForm({
        parent: this,
        name: 'lot_units[]',
        value: value
      });
      this.products_panel.add(p);
      if (!nolayout) {
        this.doLayout();
      }
    };
    ensureStoreLoaded(getOkeiStore(), insertProduct, this);
  },

  getProductsItems: function() {
    return this.products_panel.items;
  },

  removeProductsItem: function(i) {
    return this.products_panel.remove(i);
  },

  setValues: function(lot_units) {
    if (Ext.isEmpty(lot_units) || !Ext.isDefined(lot_units.length) || lot_units.length == 0)
      return;

    var updateProducts = function () {
      var i;
      var to_del = [];
      this.getProductsItems().each(function(i) {
        to_del.push(i);
      });
      for (i = 0; i < to_del.length; i++) {
        this.removeProductsItem(to_del[i]);
      }
      for (i = 0; i < lot_units.length; i++) {
        this.addProduct(lot_units[i], true);
      }
      this.doLayout();
    }

    var store = getOkeiStore();
    ensureStoreLoaded(store, updateProducts, this);
  }
});
