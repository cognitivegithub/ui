
Ext.define('Application.components.subjectForm', {
  extend: 'Ext.form.Panel',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    
    this.subject_id = Ext.id(), this.descr_id = Ext.id();
    
    var condition_store = getConditionStore();
    condition_store.load();
    var okei_store = getOkeiStore();
    var week_store = getWeekStore(100);
    
    var nomenclature_id = Ext.id(), start_price_id=Ext.id(), discount_period_id=Ext.id(), quantity_id=Ext.id(),
        discount_slider_id=Ext.id(), total_price_id=Ext.id(), doc_panel_id=Ext.id(), service_fee_id=Ext.id();

    addEvents(this, ['procedurechanged', 'startpricechanged','onEditing','idchanged']);
    
    /*var pic_form = {
      title: 'Изображения товара',
      name: 'lot_unit_pictures',
      id: picture_panel_id,
      type: 1,
      procform: this.parent,
      xtype: 'Application.components.lotunitdocForm'
    };*/
    var doc_form = new Application.components.lotunitdocForm({
      title: 'Документация о товаре',
      name: 'lot_unit_documents',
      id: doc_panel_id,
      type: 2,
      procform: this.parent
    });
    
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
      bodyCssClass: 'subpanel',
      items: [{
        style: 'margin-top: 4px',
        items: [{
          fieldLabel: 'Наименование товара (полностью)'+REQUIRED_FIELD,
          qtipConfig: {
            html: 'Введите наименование товара полностью, а также основные характеристики товара',
            autoHide: true,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ]
        }, {
          xtype: 'textarea',
          hideLabel: true,
          name: 'lot_unit_name',
          id: this.subject_id,
          height: 60
        }, {
          xtype: 'Application.components.combo',
          fieldLabel: 'Состояние товара',
          qtipConfig: {
            html: 'Пожалуйста, укажите состояние, в котором находится реализуемый товар. В случае если'+
              ' фактическое состояние товара будет отличаться от указанного, покупатель будет иметь право'+
              ' уклониться от заключения договора купли-продажи',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          name: 'condition',
          hiddenName: 'condition',
          displayField: 'name',
          valueField: 'id',
          editable: false,
          triggerAction: 'all',
          forceSelection: true,
          mode: 'local',
          emptyText: 'Выберите текущее состояние товара',
          store: condition_store
        }, {
          xtype: 'textfield',
          fieldLabel: 'Количество',
          id: quantity_id,
          qtipConfig: {
            html: 'Укажите имеющееся у Вас количество единиц товара',
            autoHide: true,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          name: 'quantity',
          value: 1,
          listeners: {
            change: function(field, newVal) {
              var unit_price = parsePrice(Ext.getCmp(start_price_id).getValue());
              var qty = parsePrice(newVal);
              Ext.getCmp(total_price_id).setTotalPrice(unit_price, qty);
            }
          }
        }, {
          xtype: 'Application.components.combo',
          fieldLabel: 'Единица измерения',
          qtipConfig: {
            html: 'В чем измеряется количество Вашего товара',
            autoHide: true,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          name: 'okei_id',
          hideTrigger: true,
          hiddenName: 'okei_id',
          displayField: 'name',
          valueField: 'name',
          typeAhead: true,
          forceSelection: true,
          minChars: 1,
          triggerAction: 'query',
          mode: 'remote',
          store: okei_store
        },{
          fieldLabel: 'Описание и характеристики товара'+REQUIRED_FIELD,
          qtipConfig: {
            html: 'Укажите все значимые характеристики Вашего товара в данном поле. Чем подробнее Вы опишете товар, тем больше шансов быстро и выгодно его продать',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ]
        }, {
          xtype: 'textarea',
          hideLabel: true,
          name: 'lot_unit_description',
          id: this.descr_id,
          height: 160
        }, {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          name: 'start_price',
          id: start_price_id,
          qtipConfig: {
            html: 'В данном поле содержится значение начальной цены за единицу товара',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          minValue: 1,
          width: 150,
          anchor: false,
          fieldLabel: 'Начальная цена за единицу товара'+REQUIRED_FIELD,
          listeners: {
            change: function(field, newVal) {
              var unit_price = parsePrice(newVal);
              var qty = parsePrice(Ext.getCmp(quantity_id).getValue());
              Ext.getCmp(total_price_id).setTotalPrice(unit_price, qty);
              //component.fireEvent('startpricechanged', parsePrice(newVal));
            },
            valueFilled: function(val) {
              //component.fireEvent('startpricechanged', parsePrice(val));
            }
          }
        },
        {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          name: 'total_start_price',
          id: total_price_id,
          qtipConfig: {
            html: 'В данном поле автоматически рассчитывается общая стоимость лота',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          minValue: 1,
          width: 150,
          anchor: false,
          readOnly: true,
          cls: 'readonly',
          fieldLabel: 'Начальная цена лота',
          listeners: {
            valueFilled: function(val) {
              var service_fee=0;
              val = parsePrice(val);
              if(Ext.isEmpty(val) || val==0) 
                return;
              if(!Main.config.lot_publish_fee_fixed) {
                service_fee = val*Main.config.lot_publish_fee_percent/100;
                service_fee = (service_fee >Main.config.lot_publish_maxprice) ? Main.config.lot_publish_maxprice : service_fee;
              } else {
                service_fee = Main.config.lot_publish_fee;
              }
              Ext.getCmp(service_fee_id).setValue(service_fee);
              component.fireEvent('startpricechanged', parsePrice(val));
            }
          },
          setTotalPrice : function(unit_price, qty) {
            if(unit_price==0 || qty == 0) {
              return;
            }
            var total_price = unit_price*qty;
            this.setValue(total_price);
            this.fireEvent('valueFilled', total_price);
          }
        },
        {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          readOnly: true,
          cls: 'readonly',
          name: 'service_fee',
          id: service_fee_id,
          qtipConfig: {
            html: 'В данном поле автоматически рассчитывается плата за публикацию лота',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          minValue: 1,
          width: 150,
          anchor: false,
          fieldLabel: 'Плата за публикацию лота'
        },
        {
          xtype: 'textfield',
          fieldLabel: 'Минимальное количество',
          value: 1,
          width: 150,
          anchor: false,
          qtipConfig: {
            html: 'Потенциальные покупатели не смогут подавать заявки на приобретение Вашего товара в количестве, ниже указанного в данном поле',
            title: 'Внимание!',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          name: 'min_quantity'
        }]
      }, {
        title: 'Тип товара',
        id: nomenclature_id,
        type: 'okp',
        xtype: 'Application.components.nomenclaturePanel'
      }, {
        xtype: 'fieldset',
        title: 'Настройки автоматической переоценки',
        items: [
        {
          xtype: 'combo',
          fieldLabel: 'Время переоценки',
          name: 'discount_period',
          hiddenName: 'discount_period',
          displayField: 'name',
          valueField: 'id',
          editable: false,
          triggerAction: 'all',
          forceSelection: true,
          mode: 'local',
          width: 150,
          anchor: false,
          qtipConfig: {
            html: 'Время, по истечении которого в случае отсутствия предложений покупателей лот автоматически перевыставляется '+
              'по более низкой начальной стоимости. В случае если Вы выберете значение "НЕ ЗАДАНО", лот не будет автоматически перевыставлен.',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          value: 0,
          id: discount_period_id,
          emptyText: 'Выберите количество недель для автоматической переоценки',
          store: week_store,
          listeners: {
            select: function(combo) {
              var discount_set = combo.getValue();
              var sliderCmp = Ext.getCmp(discount_slider_id);
              if(discount_set!=0 && discount_set!='') {
                sliderCmp.enable();
              } else {
                sliderCmp.disable();
              }
            }
          }
        },
        {
          name: 'discount_percent',
          id: discount_slider_id,
          xtype: 'Application.components.sliderPanel',
          basicField: start_price_id,
          numberParams: {
            xtype: 'Application.components.priceField',
            fieldLabel: 'Размер дисконта переоценки в валюте лота',
            width: 150
          },
          sliderParams: {
            fieldLabel: 'Размер дисконта переоценки (%)',
            qtipConfig: {
              html: 'В данном поле Вы можете указать, на сколько процентов должна быть снижена начальная цена лота за единицу '+
                'в случае, если за указанное время до переоценки не было подано ни одного предложения.',
              autoHide: false,
              applyTipTo: 'label'
            },
            plugins: [Ext.ux.plugins.ToolTip ],
            width: 500
          },
          disabled: true
        }      
        ]
      }, 
      //pic_form, 
      doc_form
      ],
      setValues: function(v) {
        //setComponentValues(this, v, true);
        // Валуи сетятся в procedureForm автоматом, кроме вот этого
        if (v.nomenclature) {
          var cmp = Ext.getCmp(nomenclature_id);
          cmp.setValue(v.nomenclature);
        }
        
      }
    });
    this.listeners = this.listeners||{};

    Ext.apply(this.listeners, {
      procedurechanged: function(p) {
        
      },
      idchanged: function(id) {
        doc_form.procedure_id = id;
      },
      
      onEditing: function() {
        //Ext.getCmp(this.subject_id).setDisabled(true);
      },
      startpricechanged: function(p) {
        
        if(p && p<1) {
          Ext.Msg.alert('Предупреждение', 'Начальная цена не может быть меньше 1 (одного) рубля/доллара/евро');
        }
        var sliderCmp = Ext.getCmp(discount_slider_id);
        var discount_period = Ext.getCmp(discount_period_id).getValue();
        var discount_percent = Ext.getCmp(discount_slider_id).getValue();
        if(!Ext.isEmpty(discount_percent) && discount_period>0) {
          sliderCmp.setValue(Ext.util.Format.formatPrice(p*(discount_percent/100)));
          sliderCmp.enable();
        } else {
          if(discount_period==0) sliderCmp.disable();
        }
      }
    });

    Application.components.subjectForm.superclass.initComponent.call(this);
    
    if (this.value) {
      autoSetValue(this);
    } 
    
  }
});
