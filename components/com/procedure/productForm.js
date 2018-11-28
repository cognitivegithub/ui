Ext.define('Application.components.productForm', {
  extend: 'Ext.form.FieldSet',
  autoHeight: true,
  parent: null,
  border: true,
  isInnovation: false,
  editReqFields: true, // разрешает редактирование обязательных полей
  disableAllFields: false, // Запрещает редактирование полей
  collapsed: true,

  initComponent: function () {
    var component = this;
    this.labelWidth = this.labelWidth || 300;

    this.addEvents('nomenclature_selected');
    this.addEvents('nomenclature_clean');
    this.addEvents('startpricechanged');

    this.total_id = Ext.id();
    this.price_id = Ext.id();
    this.quantity_id = Ext.id();
    this.okved_id = Ext.id();
    this.okved2_id = Ext.id();
    this.name_id = Ext.id();
    this.okdp_id = Ext.id();
    this.okpd_id = Ext.id();
    this.okpd2_id = Ext.id();
    this.okpd2_smsp_id = Ext.id();
    this.okei_id = Ext.id();
    this.current_year_quantity_id = Ext.id();
    this.current_year_price_id = Ext.id();

    this.old_price_id = Ext.id();
    this.can_change_price_id = Ext.id();
    this.percent_info_id = Ext.id();
    this.nds_id = Ext.id();
    this.price_without_nds_id = Ext.id();

    this.po_items = [];

    /**
     * #PRESS-1019 и #TECHSUPPORT-2003
     * Volobuev-AN
     * 02.12.2015
     * Добавил флаг current_year_price_id_loaded для того,
     * чтобы при первой загрузке не расчитывалось поле current_year_price,
     * а подхватывалось из БД, или оставалось пустым, если Новая потребность
     * */
    this.current_year_price_id_loaded = false;

    //POSPBA-516 блок перенесен в начало формы, перед классификатором
    //this.po_items.push(this.getOKVDCodeSet());
    
    var disabled_price = false;
    var hide_can_change_price = true;
    var hide_old_price = true;
    var disabled_can_change_price = false;
    var disabled_old_price = false;
    var hide_percent_info = true;

    // условие обязательности в зависимости от шагов. Хотя PSEUDO_STEP_NOTICE_NEW || PSEUDO_STEP_NOTICE_NEW это странно.
    // var isPosNdsRequired = component.lot_step == PSEUDO_STEP_NOTICE_NEW || component.lot_step == PSEUDO_STEP_NOTICE_NEW;
    var isPosNdsRequired = true;

    if (component.lot_step == 'in_scheduled_plan_oos' ){
       hide_can_change_price = false;
       disabled_price = true;
    } else if (component.lot_step == 'purchase_on_agreement'){
       hide_can_change_price = false;
       disabled_can_change_price = true;
       disabled_old_price = true;
       hide_percent_info = false;
       disabled_price = true;
    } else if (component.lot_step == 'wait_agreement_supervisor'){
      hide_can_change_price = false;
    }

    //poveba-146
    if (Main.config.temporary_show_okved_block) {
       this.po_items.push(this.getOKVDCodeSet());
    }
    if (Main.config.show_okpd2_and_okved2) {
       this.po_items.push(this.getOKVED2CodeSet());
    }

    if (Main.config.classificator_okdp_only) {
        this.po_items.push(this.getOKDPCodeSet());
    } else {
      this.po_items.push(this.getOKPDCodeSet());
    }

    if (Main.config.show_okpd2_and_okved2) {
    	this.po_items.push(this.getOKPD2CodeSet());
    }

    this.po_items.push(
      {
        xtype: 'textfield',
        fieldLabel: 'Наименование позиции',
        allowBlank: false,
        ref: 'product_name',
        itemCls: 'required',
        cls: component.isCanceled ? 'x-readonly' : '',
        name: 'name',
        id: this.name_id,
        readOnly: ((this.isDisabled) ? this.isDisabled : false) || component.isCanceled,
        disabled: !component.editReqFields || component.disableAllFields,
        listeners: {
          blur: function (t) {
            var val = t.getValue();
            component.parent.fireEvent('setsubject', val);
          },
          change: function (cmp, newVal) {
            if (newVal != undefined) {
              cmp.findParentByType('fieldset').setTitle(newVal);
            }
          }
        }
      },
      {
        xtype: 'Application.components.combo',
        fieldLabel: 'Единица измерения',
        name: 'okei_code',
        hiddenName: 'okei_code',
        displayField: 'name',
        valueField: 'code',
        itemCls: 'required',
        cls: component.isCanceled ? 'x-readonly' : '',
        forceSelection: true,
        triggerAction: 'all',
        mode: 'local',
        allowBlank: false,
        store: getOkeiStore(),
        readOnly: ((this.isDisabled) ? this.isDisabled : false) || component.isCanceled,
        id: this.okei_id,
        value: 796,
        hidden: Main.config.okei_code_hide && component.isInnovation,
        disabled: !component.editReqFields || component.disableAllFields
      }, {
        ref: 'price',
        xtype: 'container',
        layout: 'column',
        fieldLabel:  t('Цена за единицу без НДС'),
        itemCls: 'required',
        items: [{
          xtype: 'Application.components.numberField',
          maskRe: /\d|\s|[,.]/,
          columnWidth: 0.4,
          decimalPrecision: 4,
          allowDecimal: true,
          allowBlank: (!Main.config.price_id_non_required)?false:true,
          itemCls: (!Main.config.price_id_non_required)?'required':'',
          fieldLabel: t('Цена за единицу без НДС') ,
          id: this.price_without_nds_id,
          readOnly: ((this.isDisabled) ? this.isDisabled : false) || disabled_price,
          disabled: this.disableAllFields || !this.editReqFields,
          hidden: Main.config.price_id_hide && component.isInnovation,
          listeners: {
            afterrender: function(){
              if(((this.isDisabled) ? this.isDisabled : false) || disabled_price){
                Ext.getCmp(component.price_without_nds_id).removeClass('fake-non-disabled').removeClass('fake-disabled').addClass('fake-disabled');
              }
            },
            change: function(cmp, newVal) {
              component.fireEvent('startpricechanged', parsePrice(newVal));
              var nds = Ext.getCmp(component.nds_id).getValue();
              if (newVal) {
                var priceWithNds = Application.models.Po_Procedure.getPriceWithNds(newVal, nds);
                Ext.getCmp(component.price_id).setValue(priceWithNds);
                component.reCalcTotalPriceWithNds(component);
              }
              if (!component.lot_step) {
                Ext.getCmp(component.old_price_id).setValue(Ext.getCmp(component.price_id).getValue());
              }

            }
          }
        }, {
          xtype: 'displayfield',
          html: "НДС, %" + (isPosNdsRequired ? REQUIRED_FIELD : ''),
          columnWidth: 0.17,
          style: 'padding-left: 5px;padding-top: 2px;'
        }, {
          xtype: 'combo',
          itemCls: isPosNdsRequired && !Main.config.price_id_non_required ? 'required' : '',
          cls: component.isCanceled ? 'x-readonly' : '',
          allowBlank: !(isPosNdsRequired && !Main.config.price_id_non_required),
          name: 'pos_nds',
          id: component.nds_id,
          readOnly: this.isDisabled || component.isCanceled,
          disabled: component.disableAllFields || !this.editReqFields,
          hidden: Main.config.price_id_hide && component.isInnovation,
          mode: 'local',
          flex: 1,
          store: createVocabVatStorage(),
          editable: true,
          valueField: 'value',
          displayField: 'name',
          triggerAction: 'all',
          columnWidth: 0.43,
          value: 18,
          listeners: {
            beforerender: function () {
              var store = this.getStore();
              store.on('load', function () {
                if (this.value) {
                  this.setValue(this.value);
                }
              }, this, {single: true});
            }, select: function (combo, record) {
              var newValue = record.data.value;
              if (newValue) {
                var price = Ext.getCmp(component.price_id).getValue();
                var priceWithoutNds = Application.models.Po_Procedure.getPriceWithoutNds(price, newValue);
                Ext.getCmp(component.price_without_nds_id).setValue(priceWithoutNds);
                component.reCalcTotalPriceWithNds(component);
              }
            },
            change: function (cmp, newValue) {
              if (newValue) {
                var price = Ext.getCmp(component.price_id).getValue();
                var priceWithoutNds = Application.models.Po_Procedure.getPriceWithoutNds(price, newValue);
                Ext.getCmp(component.price_without_nds_id).setValue(priceWithoutNds);
                component.reCalcTotalPriceWithNds(component);
              }
            }
          }
        }]
      }, {
          xtype: 'Application.components.numberField',
          decimalPrecision: 4,
          fieldLabel:  t('Цена за единицу c НДС'),
          maskRe: /\d|\s|[,.]/,
          name: 'price',
          id: component.price_id,
          readOnly: ((this.isDisabled) ? this.isDisabled : false) || disabled_price,
          disabled: this.disableAllFields || !this.editReqFields,
          hidden: Main.config.price_id_hide && component.isInnovation,
          listeners: {
            change: function (cmp, newValue) {
              var nds = Ext.getCmp(component.nds_id).getValue();
              if (newValue) {
                var priceWithoutNds = Application.models.Po_Procedure.getPriceWithoutNds(newValue, nds);
                Ext.getCmp(component.price_without_nds_id).setValue(priceWithoutNds);
                component.reCalcTotalPriceWithNds(component);
              }
            }
          }
        }, {
        ref:'priceChangeContainer',
        xtype: 'container',
        layout: 'column',
        fieldLabel: 'Изменить цену',
        hidden: hide_can_change_price,
        disabled: disabled_can_change_price || component.disableAllFields,
        items: [
          {
            xtype: 'checkbox',
            name: 'can_change_price',
            id: this.can_change_price_id,
            labelStyle: 'width:280px;',
            hidden: hide_can_change_price,
            disabled: disabled_can_change_price || component.disableAllFields,
            listeners: {
              check: {
                fn: function (combo, checked) {
                  var price = this.price.getValue();
                  var percent = 10;
                  if (checked && !this.priceChangeContainer.disabled) {
                    this.priceChangeContainer.range.setValue(
                      'от: ' +
                      Ext.util.Format.price(price * ((100 - percent)/100)) +
                      ' до: ' +
                      Ext.util.Format.price(price * ((100 + percent)/100))
                    );

                    Ext.getCmp(component.price_id).setReadOnly(false);
                    Ext.getCmp(component.price_id).removeClass('fake-non-disabled').removeClass('fake-disabled').addClass('fake-non-disabled');
                  } else {
                    if (!this.priceChangeContainer.disabled) {
                      this.priceChangeContainer.range.setValue('');
                    }

                    Ext.getCmp(component.price_id).setReadOnly(true);
                    Ext.getCmp(component.price_id).removeClass('fake-non-disabled').removeClass('fake-disabled').addClass('fake-disabled');
                  }

                },
                scope: this
              },
              afterrender: function(combo){
                if (!hide_can_change_price) {
                  if (combo.getValue()) {
                    Ext.getCmp(component.price_id).setReadOnly(false);
                    Ext.getCmp(component.price_id).removeClass('fake-non-disabled').removeClass('fake-disabled').addClass('fake-non-disabled');
                  } else {
                    Ext.getCmp(component.price_id).setReadOnly(true);
                    Ext.getCmp(component.price_id).removeClass('fake-non-disabled').removeClass('fake-disabled').addClass('fake-disabled');
                  }
                }
              }
            }
          },
          {
            ref: 'range',
            html: "",
            xtype: "displayfield",
            columnWidth: 1
          }
        ]
      },
      {
        xtype: 'Application.components.priceField',
        allowNegative: false,
        allowDecimal: true,
        minValue: 0.01,
        maxValue: 999999999999,
        allowBlank: true,
        fieldLabel: 'Первоначальная цена за единицу',
        name: 'old_price',
        id: this.old_price_id,
        hidden: hide_old_price,
        disabled: disabled_old_price || component.disableAllFields
      },
      {
        ref: 'percentInfo',
          xtype: 'displayfield',
          fieldLabel: 'Первоначальная цена',
          name: 'percent_info',
          hidden: hide_percent_info,
          id: this.percent_info_id,
          listeners: {
          afterrender: function(){
              var priceCmp = Ext.getCmp(component.price_id);
              var oldpriceCmp = Ext.getCmp(component.old_price_id);
              var x;
              if (priceCmp.getValue() && oldpriceCmp.getValue()) {
                var price = priceCmp.getValue();
                var oldPrice = oldpriceCmp.getValue();
                if(price > 0){
                  x = (100 * price / oldPrice) - 100;
                  Ext.getCmp(component.percent_info_id).setValue(Ext.util.Format.price(oldPrice) + ' (' + x.toFixed(2) + '%' + ')' );
                }
                if (price == oldPrice) {
                  Ext.getCmp(component.percent_info_id).hide();
                }
              }
          }
        }
      },
      {
        xtype: 'Application.components.quantityField',
        precision: 3,
        fieldLabel: 'Количество',
        renderPrecision: false,
        allowBlank: false,
        maxLength: 20,
        itemCls: 'required',
        cls: component.isCanceled ? 'x-readonly' : '',
        name: 'quantity',
        id: this.quantity_id,
        readOnly: ((this.isDisabled) ? this.isDisabled : false) || component.isCanceled,
        hidden: Main.config.quantity_id_hide && component.isInnovation,
        disabled: !component.editReqFields || component.disableAllFields,
        listeners: {
          change: function (field, newValue, oldValue) {
            component.reCalcTotalPriceWithNds(component);
            Ext.getCmp(component.current_year_quantity_id).quantityChanged(this.getValue());
          },
          added: function() {
            if(component.product_quantity != undefined && component.product_quantity != null && component.product_quantity != 'free'){
                this.setValue(component.product_quantity);
                this.setReadOnly(true);
            }
          }
        }
      },
      {
        xtype: 'Application.components.quantityField',
        fieldLabel: 'Количество товара (объем) поставки в текущем году исполнения ' + t('контракта'),
        renderPrecision: false,
        allowBlank: this.isInnovation ? true : false,
        maxLength: 20,
        itemCls: this.isInnovation? null: 'required',
        name: 'current_year_quantity',
        maxValue: 999999999999,
        minValue: 0,
        id: this.current_year_quantity_id,
        hidden: Main.config.replace_quantity_to_price,
        allowZero: (Main.config.can_be_zero_current_year_quantity ? true : false),
        readOnly: ((this.isDisabled) ? this.isDisabled : false) || component.isCanceled,
        disabled: !component.editReqFields || component.disableAllFields,
        quantityChanged: function(value){
//            var oldValue = this.getValue();
//            if(oldValue == null || value < oldValue){
                this.setValue(value);
//            }
            this.maxValue = value;
            this.validate();
        }
      },
      {
        xtype: 'Application.components.priceField',
        fieldLabel: 'Часть стоимости закупки, оплата которой предусмотрена в текущем году исполнения договора',
        maxLength: 20,
        name: 'current_year_price',
        ref: 'current_year_price',
        maxValue: 999999999999,
        minValue: 0,
        id: this.current_year_price_id,
        hidden: Main.config.hide_quantity_or_price,
        listeners:
        {
          afterrender: function ()
          {
            var totalPriceWithNds = Ext.getCmp(component.total_id).getValue();
            Ext.getCmp(component.current_year_price_id).setValue(totalPriceWithNds);
          }
        }
      },
      {
        xtype: 'Application.components.priceField',
        fieldLabel: t('Итого по позиции с учетом НДС'),
        name: 'total',
        minValue: 0.01,
        maxValue: 999999999999,
        itemCls: (!Main.config.total_id_non_required)?'required':'',
        cls: component.isCanceled ? 'x-readonly' : '',
        allowBlank: (!Main.config.total_id_non_required)?false:true,
        emptyText: 'произведение цены с учетом НДС на количество',
        id: this.total_id,
        readOnly: true,
        ref: 'total',
        hidden: Main.config.total_id_hide && component.isInnovation,
        disabled: !component.editReqFields || component.disableAllFields,
        listeners: {
          change: function () {
            component.fireEvent('recalc');
          },
          afterrender: function () {
            Ext.QuickTips.init();
            Ext.QuickTips.register({
                target: component.total_id,
                text: 'Поле заполняется автоматически произведением значений "Цена за единицу без НДС" и "Количество"' +
                ' этой позиции.',
                width: 300,
                dismissDelay: 20000
            });
          },
          destroy: function(){
            Ext.QuickTips.unregister(component.total_id);
          }
        }
      },
      {
        xtype: 'displayfield',
        fieldLabel: '',
        cls: 'icon-silk-information',
        style: 'padding-left: 20px;',
        value: t('(Цена за единицу без НДС) * (Количество) * (НДС)')
      },
      {
        xtype: 'Application.components.budgetArticleField',
        fieldLabel: 'Статья бюджета',
        name: 'budget_article_id',
        emptyText: (!this.editReqFields || this.disableAllFields || this.isDisabled) ? '' : 'Введите статью бюджета',
        readOnly: this.isDisabled,
        disabled: !this.editReqFields || this.disableAllFields,
        allowBlank: false,
        itemCls: 'required'
      }
    );//end var po_items

    this.com_items = [
      {
        xtype: 'textfield',
        fieldLabel: 'Наименование товара/услуги' + REQUIRED_FIELD,
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
        xtype: 'textfield',
        fieldLabel: 'Предпочтительная торговая марка',
        allowBlank: true,
        name: 'trademark'
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
        store: getOkeiStore(),
        disabled: component.disableAllFields
      },
      {
        xtype: 'Application.components.okvedField',
        fieldLabel: 'Код ОКВЭД (необязательно)',
        id: this.okved_id,
        allowBlank: true,
        hidden: true,
        name: 'okved_code',
        disabled: component.disableAllFields
      },
      {
        xtype: 'Application.components.okdpField',
        fieldLabel: 'Код ОКДП (необязательно)',
        allowBlank: true,
        name: 'okdp_code',
        disabled: component.disableAllFields
      },
      {
        xtype: 'Application.components.okved2Field',
        fieldLabel: 'Код ОКВЭД2 (необязательно)',
        id: this.okved2_id,
        allowBlank: true,
        name: 'okved2_code',
        hidden: !Main.config.show_okpd2_and_okved2,
        disabled: component.disableAllFields
      },
      {
        xtype: 'Application.components.okdp2Field',
        fieldLabel: 'Код ОКДП2 (необязательно)',
        allowBlank: true,
        name: 'okdp2_code',
        hidden: !Main.config.show_okpd2_and_okved2,
        disabled: component.disableAllFields
      }
    ];//end var com_items

    var removeFn = function () {
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
        allowBlank: false
      },
      bodyStyle: 'padding-top: ' + (Ext.isIE ? '20' : '10') + 'px;',
      border: true,
      xtype: 'fieldset',
      title: 'Описание позиции',
      items: component.createItems(),
      collapsible: true,
      buttons: [
        {
          text: t('Добавить требование к товару'),
          disabled: this.isDisabled || component.disableAllFields,
          hidden: !Main.config.detailed_requirements,
          handler: function () {
            component.add(new Application.components.lotRequirement({parent: component}));
            component.doLayout();
          }
        },
        {
          text: t('Удалить товар'), // Кнопка "Удалить позицию"
          hidden: !component.editReqFields,
          disabled: this.isDisabled || component.disableAllFields || component.isCanceled,
          handler: function () {
            component.parent.fireEvent('productremove', component);
          }
        }
      ],
      listeners: {
          afterrender: function() {
              if (this.productsDisableFlag){
                  this.disableFieldsEdit();
              }
          }
      },
      getValues: function () {
        var v = {};
        if (this.product_id) {
          v.id = this.product_id;
        }
        collectComponentValues(this, v, true);
        if (v.name == '' && v.trademark == '') {
          return undefined;
        }
        return v;
      },
      setValues: function (v) {
        this.product_id = v.id;
        setComponentValues(this, v, true);

        if (v.name) {
          this.setTitle(v.name);
        }

        if (v.requirements) {
          this.items.each(function (c) {
            if (c.requirement) {
              component.remove(c);
            }
          });
          for (var i = 0; i < v.requirements.length; i++) {
            var req = new Application.components.lotRequirement({parent: component});
            req.setValue(v.requirements[i]);
            this.add(req);
          }
          this.doLayout();
        }
      },
      getQuantity: function () {
        return Ext.getCmp(this.quantity_id);
      },
      setUnitFirst: function () {
        component.number = 0;
        Ext.getCmp(component.okved_id).setReadOnly(false);

        if(Main.config.show_okpd2_and_okved2) {
        	Ext.getCmp(component.okved2_id).setReadOnly(false);
        }        
      }
    });
    if (!Main.config.detailed_requirements) {
      this.items.push({
        xtype: 'textarea',
        allowBlank: false,
        fieldLabel: 'Минимально необходимые требования к товару/работе/услуге',
        itemCls: 'required',
        disabled: !component.editReqFields || component.disableAllFields || component.isCanceled,
        name: 'simple_requirements',
        value: 'Согласно документации'
      });
    }
    Application.components.productForm.superclass.initComponent.call(this);
    autoSetValue(this);
  },
  createItems: function() {
    if (this.module_type == 'po') {
          return this.po_items;
        }
        else {
          return this.com_items;
        }
  },
  getFieldValue: function (field_id) {
    return Ext.getCmp(this[field_id]).getValue();
  },
  setFieldValue: function (field_id, value) {
    Ext.getCmp(this[field_id]).setValue(value);
  },
  setProductQuantity: function(value) {
      var quantity_field = Ext.getCmp(this.quantity_id);
      var cur_year_quantity_field = Ext.getCmp(this.current_year_quantity_id);
      if (quantity_field != undefined) {
          if (value == 'free') {
              quantity_field.setReadOnly(false);
              quantity_field.setValue(0);
              cur_year_quantity_field.quantityChanged(0);
          }
          else if (value != undefined && value != null && value != '') {
              quantity_field.setValue(value);
              quantity_field.setReadOnly(true);
              cur_year_quantity_field.quantityChanged(value);
          }
      }
  },
  getOKVDCodeSet: function() {
    var cmp = this;
    return {
      ref: 'okved_code',
      xtype: 'container',
      layout: 'column',
      fieldLabel: 'Код ОКВЭД',
      hidden: true,
      itemCls: (Main.config.okved_required)?'required':'',
      items: [
        {
          ref: 'okved_code',
          xtype: 'Application.components.okvdField',
          allowBlank: (Main.config.okved_required)?false:true,
          name: 'okved_code',
          storeDisplayField: 'display',
          id: cmp.okved_id,
          readOnly: ((this.isDisabled) ? this.isDisabled : false) || cmp.isCanceled,
          disabled: !this.editReqFields || this.disableAllFields,
          columnWidth: 1
        },
        Application.models.Procedure.getButtonSelectTreeWnd(
          'Выбрать код ОКВЭД', 'okved', 'code', 'Поиск по классификатору ОКВЭД',
          function(n) {
            Ext.getCmp(cmp.okved_id).setValue(n.code);
          },
          (!this.editReqFields || this.disableAllFields)
        )
      ]
    };
  },
  getOKVED2CodeSet: function() {
    var cmp = this;
    return {
      ref: 'okved2_code',
      xtype: 'container',
      layout: 'column',
      fieldLabel: 'Код ОКВЭД2',
      itemCls: 'required',
      items: [
        {
          ref: 'okved2_code',
          xtype: 'Application.components.okved2Field',
          allowBlank: false,
          name: 'okved2_code',
          storeDisplayField: 'display',
          id: cmp.okved2_id,
          readOnly: ((this.isDisabled) ? this.isDisabled : false) || cmp.isCanceled,
          disabled: !this.editReqFields || this.disableAllFields,
          columnWidth: 1
        },
        Application.models.Procedure.getButtonSelectTreeWnd(
          'Выбрать код ОКВЭД2', 'okved2', 'code', 'Поиск по классификатору ОКВЭД2',
          function(n) {
            Ext.getCmp(cmp.okved2_id).setValue(n.code);
          },
          (!this.editReqFields || this.disableAllFields || cmp.isCanceled)
        )
      ]
    };
  },
  getOKPDCodeSet: function() {
    var cmp = this;
    return {
      ref: 'okpd_code',
      xtype: 'compositefield',
      fieldLabel: 'Код ОКПД',
      hidden: true,
      items: [
        {
          ref: 'okpd_code',
          xtype: 'Application.components.okpdField',
          allowBlank: true,
          storeDisplayField: 'display',
          id: cmp.okpd_id,
          name: 'okpd_code',
          readOnly: ((this.isDisabled) ? this.isDisabled : false) || cmp.isCanceled,
          flex: 0.9
        },
        Application.models.Procedure.getButtonSelectTreeWnd(
          'Выбрать код ОКПД', 'okpd', 'code', 'Поиск по классификатору ОКПД',
          function(n) {
            Ext.getCmp(cmp.okpd_id).setValue(n.code);
          },
          (!this.editReqFields || this.disableAllFields)
          )
      ]
    };
  },

  getOKPD2CodeSet: function() {
    var cmp = this;
    return {
      ref: 'okpd2_code',
      xtype: 'container',
      layout: 'column',
      fieldLabel: 'Код ОКПД2',
      itemCls: 'required',
      items: [
        {
          ref: 'okpd2_code',
          xtype: 'Application.components.okpd2Field',
          allowBlank: false,
          storeDisplayField: 'display',
          id: cmp.okpd2_id,
          name: 'okpd2_code',
          readOnly: ((this.isDisabled) ? this.isDisabled : false) || cmp.isCanceled,
          disabled: !this.editReqFields || this.disableAllFields,
          columnWidth: 1,
          storeFields: [
            'smsp'
          ],
          listeners: {
            scope: this,
            select: function (combo, record) {
              var lotForm = this.findParentByType('Application.components.po_procedureLotForm'),
                smspFeatures = lotForm.getSmspFeatureCheckbox(),
                advancePayAmount = lotForm.getAdvancePayAmountField(),
                applicShareReq = lotForm.getApplicShareReq(),
                contractShareReq = lotForm.getContractShareReq(),
                bankGuaranteeContractReq = lotForm.getBankGuaranteeContractReq(),
                bankGuaranteeApplicReq = lotForm.getBankGuaranteeApplicReq(),
                isSmspAvailable = false,
                okpd2Smsp;

              Ext.getCmp(cmp.okpd2_smsp_id).setValue(!!record.get('smsp'));
              okpd2Smsp = this.findParentByType('Application.components.productList').find('name', 'okpd2_smsp');

              Ext.each(okpd2Smsp, function () {
                if (this.getValue()) {
                  isSmspAvailable = true;
                }
              });

              if (isSmspAvailable) {
                smspFeatures.setValue(true);
                // На данный момент не используем ограничение по минимуму согласно закону
                // advancePayAmount.setSmspMinimum();
                applicShareReq.setMaxSmspValue();
                contractShareReq.setMaxSmspValue();
                bankGuaranteeContractReq.setValue(true);
                bankGuaranteeApplicReq.setValue(true);
              } else {
                smspFeatures.setValue(false);
                // На данный момент не используем ограничение по минимуму согласно закону
                // advancePayAmount.removeSmspMinimum();
                applicShareReq.setMaxNotSmspValue();
                contractShareReq.setMaxNotSmspValue();
                bankGuaranteeContractReq.setValue(false);
                bankGuaranteeApplicReq.setValue(false);
              }
            }
          }
        }, {
          xtype: 'checkbox',
          name: 'okpd2_smsp',
          id: cmp.okpd2_smsp_id,
          hidden: true
        },
        Application.models.Procedure.getButtonSelectTreeWnd(
          'Выбрать код ОКПД2', 'okpd2', 'code', 'Поиск по классификатору ОКПД2',
          function(n) {
            Ext.getCmp(cmp.okpd2_id).setValue(n.code);
          },
          (!this.editReqFields || this.disableAllFields || cmp.isCanceled)
        )
      ]
    };
  },

  getOKDPCodeSet: function() {
    var cmp = this;
    return {
      ref: 'okdp_code_set',
      xtype: 'container',
      layout: 'column',
      fieldLabel: 'Код ОКДП',
      hidden: true,
      itemCls: (Main.config.okdp_required)?'required':'',
      items: [
        {
          ref: 'okdp_code_field',
          xtype: 'Application.components.okdpField',
          storeDisplayField: 'display',
          id: cmp.okdp_id,
          name: 'okdp_code',
          allowBlank: (Main.config.okdp_required)?false:true,
        //  readOnly: (this.isDisabled) ? this.isDisabled : false,
          readOnly: ((this.isDisabled) ? this.isDisabled : false) || cmp.isCanceled,
          disabled: !this.editReqFields || this.disableAllFields,
          columnWidth: 1
        },
        Application.models.Procedure.getButtonSelectTreeWnd(
          'Выбрать код ОКДП', 'okdp', 'code', 'Поиск по классификатору ОКДП',
          function(n) {
            cmp.okdp_code_set.okdp_code_field.setValue(n.code);
          },
          (!this.editReqFields || this.disableAllFields || cmp.isCanceled)
          )
      ]
    };
  },
  disableFieldsEdit: function(){
      for (var i = 0; i < this.items.items.length; i++){
          this.items.items[i].setDisabled(true);
      }
      for (var i = 0; i < this.buttons.length; i++){
          this.buttons[i].setDisabled(true);
      }
  },

  /**
   * Пересчитать итоговую сумму по позиции с учетом НДС, руб.
   *
   * @param {Object} component Компонент.
   *
   * @return void|null
   */
  reCalcTotalPriceWithNds: function (component) {
    var price = Ext.getCmp(component.price_id).getValue(),
        nds = Ext.getCmp(component.nds_id).getValue(),
        priceWithoutNds = Ext.getCmp(component.price_without_nds_id).getValue();

    if (price == null) {
      return null;
    }

    if (priceWithoutNds == null) {
      priceWithoutNds = Application.models.Po_Procedure.getPriceWithoutNds(price, nds);
      Ext.getCmp(component.price_without_nds_id).setValue(priceWithoutNds);
    }

    var quantity = Ext.getCmp(component.quantity_id).getValue(),
        totalPriceWithNds = Application.models.Po_Procedure.getTotalPriceWithNds(priceWithoutNds, quantity, nds);
    
    Ext.getCmp(component.total_id).setValue(totalPriceWithNds);
    Ext.getCmp(component.current_year_price_id).setValue(totalPriceWithNds);
    Ext.getCmp(component.total_id).fireEvent('change');
  }
});
