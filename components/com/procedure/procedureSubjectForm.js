
Ext.define('Application.components.procedureSubjectForm', {
  extend: 'Ext.form.Panel',
  autoHeight: true,
  initComponent: function() {
    var component = this;

    this.products_list_id = Ext.id();
    this.add_positional_id = Ext.id();
    this.subject_id = Ext.id();
    var price_cut_off_id = Ext.id();
    this.start_price_id = Ext.id();
    var nomenclature_id = Ext.id();
    var okved_id = Ext.id();
    var okved2_id = Ext.id();
    var single_unit_id = Ext.id();
    var no_price_ids = [this.start_price_id/*, single_unit_id*/];

    addEvents(this, ['procedurechanged', 'stageschanged', 'productremove', 'startpricechanged','onEditing', 'lotpricechanged']);

    Ext.apply(this, {
      labelWidth: 300,
      defaults: {
        anchor: '100%',
        xtype: 'fieldset',
        defaults: {
          border: false,
          anchor: '100%',
          labelWidth: 300,
          allowBlank: false
        }
      },
      bodyCssClass: 'subpanel-top-padding',
      items: [{
        style: 'padding-top: 6px;',
        items: [{
          fieldLabel: 'Предмет договора (полностью)'+REQUIRED_FIELD
        }, {
          xtype: 'textarea',
          hideLabel: true,
          name: 'subject',
          id: this.subject_id,
          height: 160
        }, {
          xtype: 'Application.components.dateField',
          anchor: null,
          fieldLabel: 'Срок заключения договора',
          format: 'd.m.Y',
          name: 'date_end_contract',
          allowBlank: true,
          hidden: (Main.config.contracts_date_end_contract ? false : true)
        }, {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          name: 'start_price',
          id: this.start_price_id,
          minValue: 0.01,
          maxValue: 999999999999,
          width: 100,
          anchor: false,
          fieldLabel: 'Начальная цена'+REQUIRED_FIELD,
          listeners: {
            change: function(field, newVal) {
              component.fireEvent('startpricechanged', parsePrice(newVal));
            },
            valueFilled: function(val) {
              //component.fireEvent('startpricechanged', parsePrice(val));
            }
          }
        }, {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          name: 'price_cut_off',
          id: price_cut_off_id,
          minValue: 0.01,
          maxValue: 999999999999,
          width: 100,
          anchor: false,
          allowBlank: false,
          fieldLabel: 'Цена отсечения'+REQUIRED_FIELD,
          msgTarget: 'under',
          hidden: true
        }, {
          xtype: 'checkbox',
          hideLabel: true,
          hidden: !Main.config.allow_single_unit,
          boxLabel: 'Торги за единицу',
          name: 'single_unit',
          listeners: {
            check: function(field, newVal) {
              var price_field = Ext.getCmp(single_unit_id);
              if (!price_field) {
                return;
              }
              if (newVal) {
                price_field.enable();
                price_field.show();
                component.doLayout();
              } else {
                price_field.disable();
                price_field.hide();
              }
            }
          }
        }, {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          name: 'unit_price',
          id: single_unit_id,
          minValue: 0.01,
          maxValue: 999999999999,
          width: 100,
          anchor: false,
          hidden: true,
          disabled: true,
          fieldLabel: 'Начальная цена комплекта'+REQUIRED_FIELD
        }]
      },
        {
          xtype: 'Application.components.treeSelector',
          title: 'Классификатор ОКДП',
          addText: 'Добавить позицию',
          name: 'nomenclature',
          keyName: 'code',
          emptyText: false,
          maxItems: 1,
          treeDirectFn: RPC.Reference.okdp,
          treeDirectSearchFn: RPC.Reference.okdpSearch,
          treeSearch: true,
          treeSearchHelp: 'Поиск по ОКДП',
          hidden: !Main.config.lot_nomenclature_support
        },
        {
          xtype: 'Application.components.treeSelector',
          title: 'Классификатор ОКВЭД',
          addText: 'Добавить позицию',
          name: 'okved',
          keyName: 'code',
          maxItems: 1,
          emptyText: false,
          treeSearch: true,
          treeSearchHelp: 'Поиск по классификатору ОКВЭД',
          hidden: !Main.config.lot_okved_support
        },
        {
          xtype: 'Application.components.treeSelector',
          title: 'Классификатор ОКВЭД2',
          addText: 'Добавить позицию',
          name: 'okved2',
          keyName: 'code',
          maxItems: 1,
          emptyText: false,
          treeSearch: true,
          treeSearchHelp: 'Поиск по классификатору ОКВЭД2',
          hidden: !Main.config.show_okpd2_and_okved2
        },
        {
          xtype: 'Application.components.productAddPositional',
          id: this.add_positional_id,
          disabled: true,
          hidden: true
        },
        {
          xtype: 'Application.components.productList',
          id: this.products_list_id,
          module_type: component.module_type
        }
      ],
      setValues: function(v) {
        setComponentValues(this, v, true);
        Ext.getCmp(component.products_list_id).setValues(v.lot_units);
        Ext.getCmp(component.add_positional_id).setValues(v.lot_units);
        component.fireEvent('startpricechanged', parsePrice(v.start_price));
      }

    });
    this.listeners = this.listeners||{};

    Ext.apply(this.listeners, {
      procedurechanged: function(p) {
        var d = false;
        if (Application.models.Procedure.type_ids.qualification == p ) {
          d = true;
        }
        for (var i=0; i<no_price_ids.length; i++) {
          Ext.getCmp(no_price_ids[i]).setDisabled(d);
          Ext.getCmp(no_price_ids[i]).setVisible(!d);
        }

        // у запроса предложений начальная цена - не обязательна
        var start_price_val = this.start_price_id;
        var start_price_field_text = 'Начальная цена'+REQUIRED_FIELD;
        start_price_val.minValue = 0.01;
        start_price_val.allowBlank = false;
        if (Application.models.Procedure.type_ids.quotation == p || Application.models.Procedure.type_ids.paper_quotation == p) {
          start_price_field_text = 'Начальная цена';
          start_price_val.minValue = 0;
          start_price_val.allowBlank = true;
          start_price_val.clearInvalid();
        }
        if (start_price_val.label) {
          var start_price_label = start_price_val.label;
          start_price_label.update(start_price_field_text);
        } else {
          start_price_val.fieldLabel = start_price_field_text;
        }

        var prod_list = Ext.getCmp(component.products_list_id);
        var add_pos = Ext.getCmp(component.add_positional_id);
        var start_price = Ext.getCmp(component.start_price_id);

        if (p == Application.models.Procedure.type_ids.positional_purchase) {
          start_price.hide();
          start_price.disable();
          prod_list.hide();
          prod_list.disable();
          add_pos.show();
          add_pos.enable();
        } else {
          start_price.show();
          start_price.enable();
          prod_list.show();
          prod_list.enable();
          add_pos.hide();
          add_pos.disable();
        }

        if(p == Application.models.Procedure.type_ids.public_sale){
          Ext.getCmp(price_cut_off_id).show();
        }else{
          Ext.getCmp(price_cut_off_id).hide();
        }

        this.doLayout();
      },
      lotpricechanged: function(checked) {
        var start_price_val = this.start_price_id;
        if (checked) {
          start_price_val.maxValue = 999999999999;
        } else {
          start_price_val.maxValue = 100;
        }
      },
      onEditing: function() {
        Ext.getCmp(this.subject_id).setDisabled(true);
      }
      /*
       * Проверка и вывод ошибки происходит на бекенде при подписи извещения
       * Но если вдруг кому-то понадобится во фронте - оно здесь
      startpricechanged: function(p) {
        var start_price_val = Ext.getCmp(start_price_id);
        if(p<1) {
          if (!(start_price_val.allowBlank && !p)) {
            Ext.Msg.alert('Предупреждение', 'Начальная цена не может быть меньше 1 (одного) рубля/доллара/евро');
          }
        }
      }
      */
    });

    Application.components.procedureSubjectForm.superclass.initComponent.call(this);
    if (this.value) {
      // Не вызываем установку значений два раза т.к. один первый вызов происохит из procedureLotForm
      // autoSetValue(this);
    } else {
      this.on('beforerender', function() {
        var products = Ext.getCmp(this.products_list_id);
        products.addProduct();
      }, this, {once: true});
    }
  },

  getSubject: function() {
    return Ext.getCmp(this.subject_id).getValue();
  },

  getStartPrice: function() {
    return Ext.getCmp(this.start_price_id).getValue();
  },

  setStartPrice: function(price) {
    Ext.getCmp(this.start_price_id).setValue(parsePrice(price));
  },

  getProductList: function() {
    return Ext.getCmp(this.products_list_id);
  }
});
