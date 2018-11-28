Ext.define('Application.components.productList', {
  extend: 'Ext.form.FieldSet',
  products: [],
  isInnovation: false,
  editReqFields: true, // разрешает редактирование обязательных полей
  disableAllFields: false, // Запрещает редактирование полей

  initComponent: function() {

    this.products_panel = new Ext.Panel({
      items: []
    });
    this.products = [];
    this.productsDisableFlag = false;
    var component = this;

    Ext.apply(this, {
      title: function () {
        if(Main.config.list_items_fieldset_hide && component.isInnovation){

        } else {
          if (component.module_type == 'po'){
            return t('Перечень позиций');
          } else {
            return 'Перечень товаров';
          }
        }
      } (),
      anchor: '100%',
      defaults: {
        border: true
      },
      items: [
        {
          style: Main.config.veb_custom?'':'margin-bottom: 10px; margin-top: 0;',
          html: function () {
            if(Main.config.list_items_fieldset_hide){

            } else {

              if (component.module_type == 'po'){
                  return 'Опишите позицию лота одним их двух способов:</br>' +
            '1 способ:	Вручную заполните поля ОКПД и ОКВЭД.</br>' +
            '2 способ:	Поочередно выберите категорию классификатора из прикрепленного иерархического списка категорий. Затем выберите существующую позицию или опишите новую.'
              } else {
                  return 'Заполняется в случае если лот включает несколько отличающихся товарных позиций или процедура проводится в соответствии с 223-ФЗ.' +
            ' Если коды ОКДП и ОКВЭД отличаются для товаров/услуг в составе лота - введите соответствующие значения в поля ниже. ' +
            'В случае если данные коды для товаров/услуг не отличаются - воспользуйтесь соответствующими формами выбора кодов выше.'
              }

            }
          } ()
        },
        this.products_panel
      ],
      bodyCssClass: 'subpanel',
      bodyStyle: 'padding-top: 0;',
      style: 'padding-bottom: 0;',
      buttons: [
        {
          text: t('Добавить товар'),
          scope: this,
          disabled: this.isDisabled || component.isCanceled,
          hidden: !this.editReqFields,
          handler: function() {
            this.addProduct();
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
    var component = this;
    Ext.each(this.products, function (productFieldSet) {
        productFieldSet.collapse();
    });
    var insertProduct = function() {
      component.products.push(new Application.components.productForm({
        parent: this,
        border: !Main.config.veb_custom,
        name: 'lot_units[]',
        number: component.products.length,
        product_quantity: (this.product_quantity) ? this.product_quantity : 'free',
        editReqFields:this.editReqFields,
        collapsed: !!value,
//        okved_value: function() {
//            if(component.products.length > 0) {
//                return component.products[0].getFieldValue('okved_id');
//            }
//        }(),
        value: value,
        isDisabled: this.isDisabled,
        isCanceled: component.isCanceled,
        disableAllFields: component.disableAllFields,
        productsDisableFlag:  this.productsDisableFlag,
        module_type: this.module_type,
        isInnovation: this.isInnovation,
        lot_step: this.lot_step,
        listeners: {
            recalc: function() {
              if (this.module_type == 'po'){
                var sum = 0;
                if (component.products.length>0) {
                  Ext.each(component.products, function (item, key) {
                    sum += item.total.getValue();
                  });
                  component.fireEvent('recalc', sum);
                }
              }
            },
            afterrender: function(){
              this.fireEvent('recalc');
            }
            //,
//            fillOkved: function(okved_value) {
//                if (component.products.length > 1) {
//                    for (var i = 1; i < component.products.length; i++) {
//                        component.products[i].setFieldValue('okved_id', okved_value);
//                    }
//                }
//            }
        }
      }));
      this.products_panel.add(component.products.slice(-1)[0]);
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
    this.products_panel.remove(i);
    this.products.remove(i);
    if (i.number == 0) {
        if (this.products.length > 0) {
            this.products[0].setUnitFirst();
        }
    }
    if (this.products.length) {
      this.products[0].fireEvent('recalc');
    } else {
      this.fireEvent('recalc', 0)  ;
    }
    return true;
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
  },
  
  addProductToSum: function(lot_unit){
      var productList = this;
      var sumFlag = false;
      productList.getProductsItems().each(function(i) {
        var item = i.getValues();
        if(item.okdp_code == lot_unit.okdp_code && lot_unit.quantity){
            item.quantity = (parseInt(item.quantity) + parseInt(lot_unit.quantity)).toString();
            i.setFieldValue('quantity_id', item.quantity);
            i.getQuantity().fireEvent('change');
            //i.getQuantity().setValue(item.quantity);
            sumFlag = true;
        }
        else{
            sumFlag = sumFlag || false;
        }
      });
      if(!sumFlag){
          productList.addProduct(lot_unit, true);
          productList.doLayout();
      }
  },
  
  deleteProductFromSum: function(lot_unit){
      var productList = this;
      productList.getProductsItems().each(function(i) {
        var item = i.getValues();
        if(item.okdp_code == lot_unit.okdp_code && lot_unit.quantity){
            item.quantity = (parseInt(item.quantity) - parseInt(lot_unit.quantity)).toString();
            i.setFieldValue('quantity_id', item.quantity);
            i.getQuantity().fireEvent('change');
            if(0 == parseInt(item.quantity)){
                productList.removeProductsItem(i);
            }
        }
        productList.doLayout();
      });
  },
          
  setProductQuantity: function(value){
      this.product_quantity = value;
      for (var i = 0; i < this.products.length; i++) {
          this.products[i].setProductQuantity(value);
      }
  },
          
  disableFieldsEdit: function() {
      this.productsDisableFlag = true;
      for (var i = 0; i < this.buttons.length; i++){
          this.buttons[i].setDisabled(true);
      }
      var items = this.getProductsItems().items;
      if (items.length > 0){
          for (var j = 0; j < items.length; j++){
              items[j].disableFieldsEdit();
          }
      }
  }
});
