
Ext.define('Application.components.productPositionForm', {
  extend: 'Ext.form.FieldSet',
  autoHeight: true,
  parent: null,
  border: true,
  initComponent: function() {
    var component = this;
    this.labelWidth = this.labelWidth||300;

    this.addEvents('nomenclature_selected');
    this.addEvents('nomenclature_clean');

    var removeFn = function() {
      var cmp = this.findParentByType('panel');
      if (!cmp) {
        return;
      }
      cmp = cmp.findParentByType('panel');
      component.remove(cmp);
      component.doLayout();
    };

    Ext.apply(this, {
      defaults: {
        anchor: '100%',
        allowBlank: false,
        border: false
      },
      bodyStyle: 'padding-top: '+(Ext.isIE?'20':'10') + 'px;',
      style: 'margin-top: 10px; margin-bottom: 0; padding-bottom: 3px;',
      layout: 'form',
      items: [
        {
          xtype: 'Application.components.quantityField',
          fieldLabel: 'Номер позиции (порядковый)',
          renderPrecision: false,
          allowBlank: true,
          maxLength: 20,
          name: 'pos_number'
        },
        {
          xtype: 'textfield',
          fieldLabel: 'Наименование товара/услуги'+REQUIRED_FIELD,
          allowBlank: false,
          name: 'name'
        },
        {
          xtype: 'Application.components.quantityField',
          fieldLabel: 'Количество',
          renderPrecision: false,
          allowBlank: true,
          maxLength: 20,
          name: 'quantity'
        },
        {
          xtype: 'Application.components.combo',
          fieldLabel: 'Единица измерения',
          name: 'okei_code',
          hiddenName: 'okei_code',
          displayField: 'name',
          valueField: 'code',
          forceSelection: true,
          triggerAction: 'all',
          mode: 'local',
          allowBlank: true,
          store: getOkeiStore()
        },
        {
          xtype: 'numberfield',
          allowNegative: false,
          allowDecimal: true,
          allowBlank: true,
          hidden: false,
          disabled: false,
          fieldLabel: 'Цена без НДС',
          name: 'pos_price'
        },
        {
          xtype: 'numberfield',
          allowNegative: false,
          allowDecimal: true,
          allowBlank: true,
          hidden: false,
          disabled: false,
          fieldLabel: 'Цена с НДС',
          name: 'pos_price_nds'
        },
        {
          xtype: 'numberfield',
          allowNegative: false,
          allowDecimal: true,
          allowBlank: true,
          hidden: false,
          disabled: false,
          fieldLabel: 'НДС (%)',
          name: 'pos_nds'
        }
      ],
      buttons: [{
        text: 'Удалить позицию',
        handler: function() {
          component.parent.fireEvent('productremove', component);
        }
      }],
      getValues: function() {
        var v = {};
        if (this.product_id) {
          v.id = this.product_id;
        }
        collectComponentValues(this, v, true);
        if (v.name=='' && v.trademark=='') {
          return undefined;
        }
        return v;
      },
      setValues: function(v) {
        this.product_id = v.id;
        setComponentValues(this, v, true);
        if (v.requirements) {
          this.items.each(function(c){
            if (c.requirement) {
              component.remove(c);
            }
          });
          this.doLayout();
        }
      }
    });
    Application.components.productForm.superclass.initComponent.call(this);
    autoSetValue(this);
  }
});
