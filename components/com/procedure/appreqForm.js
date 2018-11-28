
Ext.define('Application.components.appreqForm', {
  extend: 'Ext.panel.Panel',
  autoHeight: true,
  initComponent: function() {
    var contr_guarantee_id = Ext.id(), app_guarantee_id = Ext.id(), app_guarantee_price_id = Ext.id(),
    app_guarantee_cb_id = Ext.id(), contr_guarantee_cb_id = Ext.id();
    var advance_guarantee_id = Ext.id(), warranty_guarantee_id = Ext.id(),
        advance_guarantee_cb_id = Ext.id(), warranty_guarantee_cb_id = Ext.id(),
        advance_guarantee_type_id = Ext.id(), warranty_duration_id = Ext.id(),
        simple_evaluation_criteries_title_id = Ext.id(), simple_evaluation_criteries_ta_id = Ext.id();
    var warranty_payments_id = Ext.id(), warranty_payments_cb_id = Ext.id();
    var warranty_guarantee_period_id = Ext.id(), warranty_guarantee_period_cb_id = Ext.id();
    var component = this;

    var guarantee_id = Ext.id();
    var no_price_ids = [guarantee_id];
    var no_simple_criteries = [simple_evaluation_criteries_title_id, simple_evaluation_criteries_ta_id];
    var insurance_types_id = Ext.id(), insurance_switch_id = Ext.id();

    var reasons_store=[], documents_store=[];

    if (Main.config.detailed_requirements) {
      reasons_store = getStore('doc_vocabs_reasons', {
        autoLoad: true,
        directFn: RPC.Reference.docvocabsIndex,
        root: 'vocabs',
        idProperty: 'id',
        paramsAsHash: true,
        fields: ['id', 'vocab'],
        baseParams: {type: 1}
      });
      documents_store = getStore('doc_vocabs_documents', {
        autoLoad: true,
        directFn: RPC.Reference.docvocabsIndex,
        root: 'vocabs',
        idProperty: 'id',
        paramsAsHash: true,
        fields: ['id', 'vocab'],
        baseParams: {type: 2}
      });
    }

    addEvents(this, ['procedurechanged', 'stageschanged', 'startpricechanged', 'lotpricechanged']);

    var app_parts_store = new Ext.data.JsonStore({
      fields: ['id', 'text', 'disabled'],
      data: [{id: 1, text: 'в первой части заявки', disabled: false},
             {id: 2, text: 'во второй части заявки', disabled: true}]
    });

    var doc_req = {
      name: 'lot_doc_requirements[]',
      defaults: {
        allowBlank: false,
        anchor: '100%'
      },
      border: true,
      layout: 'form',
      labelWidth: 300,
      bodyStyle: 'padding-top: 10px',
      style: 'margin-top: 10px; margin-bottom: 0px; padding-bottom: 0px;',
      items: [{
        xtype: 'combo',
        fieldLabel: 'Наименование требуемого документа',
        store: documents_store,
        hideTrigger: true,
        displayField: 'vocab',
        name: 'requirement',
        mode: 'local'
      }, {
        xtype: 'combo',
        fieldLabel: 'Основание требования документа',
        store: reasons_store,
        allowBlank: true,
        hideTrigger: true,
        displayField: 'vocab',
        name: 'reason',
        mode: 'local'
      }, {
        xtype: 'Application.components.combo',
        fieldLabel: 'Документ должен быть предоставлен',
        disabledField: 'disabled',
        displayField: 'text',
        valueField: 'id',
        store: app_parts_store,
        name: 'application_part',
        value: 1,
        mode: 'local',
        editable: false,
        triggerAction: 'all'
      }, {
        fieldLabel: '&nbsp;',
        hideLabel: false,
        labelSeparator: '',
        html: '(для электронных аукционов с двумя этапами рассмотрения заявок)'
      }],
      buttons: [{
        text: 'Удалить требование',
        handler: function() {
          var cmp = this.findParentByType('fieldset');
          if (cmp) {
            component.remove(cmp);
            component.doLayout();
          }
        }
      }],
      getValue: function() {
        var v = {};
        if (this.requirement_id) {
          v.id = this.requirement_id;
        }
        collectComponentValues(this, v, true);
        return v;
      }
    };

    var applic_guarantee = {
      xtype: 'Application.components.sliderField',
      defaults: {height: 22},
      numberParams: {
        xtype: 'Application.components.priceField'
      },
      maxValue: 0,
      fieldLabel: 'Размер обеспечения заявки на участие в валюте договора',
      name: 'guarantee_application',
      id: app_guarantee_id,
      getValues: function() {
        return (this.hidden ? Ext.getCmp(app_guarantee_price_id).getValue() : this.getValue());
      },
      setValues: function(val) {
        if (val) {
          this.setValue(val);
          Ext.getCmp(app_guarantee_price_id).setValue(val);
        }
      }
    };
    var applic_guarantee_price = {
      xtype: 'Application.components.priceField',
      fieldLabel: 'Размер обеспечения заявки на участие в валюте договора',
      name: 'guarantee_application_price',
      hidden: true,
      id: app_guarantee_price_id
    };
    var advance_guarantee = {
      xtype: 'Application.components.sliderField',
      numberParams: {
        xtype: 'Application.components.priceField'
      },
      disabled: true,
      maxValue: 0,
      fieldLabel: 'Размер обеспечения возврата аванса',
      name: 'guarantee_advance',
      id: advance_guarantee_id
    };
    if (!Main.config.advance_guarantee_configurable) {
      advance_guarantee = {
        xtype: 'displayfield',
        fieldLabel: 'Размер обеспечения возврата аванса',
        value: 'в размере не менее суммы авансовых платежей'
      };
    }

    var warranty_payments_checkbox = {};
    var warranty_payments_slider = {};
    if (Main.config.warranty_payments) {
      Ext.apply(warranty_payments_checkbox, {
        xtype: 'checkbox',
        hideLabel: true,
        boxLabel: 'Установлен размер обеспечения обязательства по уплате любых платежей (за исключением авансовых), в т.ч. сумм неустоек',
        id: warranty_payments_cb_id,
        name: 'warranty_payments_set',
        listeners: {
          check: function(cb, checked) {
            callComponents([warranty_payments_id], function(cmp){
              if (checked) {
                cmp.enable();
              } else {
                cmp.disable();
              }
            });
          }
        }
      });
      Ext.apply(warranty_payments_slider, {
        disabled: true,
        fieldLabel: 'Размер обеспечения обязательства по уплате любых платежей (за исключением авансовых), в т.ч. сумм неустоек',
        name: 'warranty_payments',
        id: warranty_payments_id,
        xtype: 'Application.components.sliderField',
        numberParams: {
          xtype: 'Application.components.priceField'
        },
        maxValue: 0,
        fieldLabel: 'Размер обеспечения обязательства по уплате любых платежей (за исключением авансовых), в т.ч. сумм неустоек'
      });
    }

    var warranty_guarantee_period_checkbox = {};
    var warranty_guarantee_period_slider = {};
    if (Main.config.warranty_guarantee_period) {
      Ext.apply(warranty_guarantee_period_checkbox, {
        xtype: 'checkbox',
        hideLabel: true,
        boxLabel: 'Обеспечение выполнения обязательств на период гарантийной эксплуатации',
        id: warranty_guarantee_period_cb_id,
        name: 'warranty_guarantee_period_set',
        listeners: {
          check: function(cb, checked) {
            callComponents([warranty_guarantee_period_id], function(cmp){
              if (checked) {
                cmp.enable();
              } else {
                cmp.disable();
              }
            });
          }
        }
      });
      Ext.apply(warranty_guarantee_period_slider, {
        disabled: true,
        fieldLabel: 'Обеспечение выполнения обязательств на период гарантийной эксплуатации',
        name: 'warranty_guarantee_period',
        id: warranty_guarantee_period_id,
        xtype: 'Application.components.sliderField',
        numberParams: {
          xtype: 'Application.components.priceField'
        },
        maxValue: 0,
        fieldLabel: 'Размер обеспечения выполнения обязательств на период гарантийной эксплуатации'
      });
    }

    var warranty_slider = {
      disabled: true,
      fieldLabel: 'Размер обеспечения гарантийных обязательств',
      name: 'guarantee_warranty',
      id: warranty_guarantee_id
    };

    if ('percent' == Main.config.warranty_guarantee_type) {
      warranty_slider.xtype = 'Application.components.percentSlider';
      warranty_slider.fieldLabel += ' (в % относительно итоговой цены договора)';
      warranty_slider.numberField = true;
    } else if ('text' == Main.config.warranty_guarantee_type) {
      warranty_slider.xtype = 'textfield';
      warranty_slider.name = 'guarantee_warranty_text';
    } else {
      Ext.apply(warranty_slider, {
        xtype: 'Application.components.sliderField',
        numberParams: {
          xtype: 'Application.components.priceField'
        },
        maxValue: 0
      });
    }

    var contr_guarantee_slider = {
      disabled: true,
      fieldLabel: 'Размер обеспечения договора',
      name: 'guarantee_contract',
      id: contr_guarantee_id
    };
      Ext.apply(contr_guarantee_slider, {
        xtype: 'Application.components.sliderField',
        numberParams: {
          xtype: 'Application.components.priceField'
        },
        maxValue: 0,
        fieldLabel: 'Размер обеспечения договора в валюте договора'
      });

    var guaranteeApplicationHandler = function(cmp) {
      var app_guarantee = Ext.getCmp(app_guarantee_id);
      if (cmp.getValue()) {
        app_guarantee.enable();
        Ext.getCmp(app_guarantee_price_id).enable();
      } else {
        app_guarantee.disable();
        Ext.getCmp(app_guarantee_price_id).disable();
      }
    };

    Ext.apply(this, {
      layout: 'form',
      bodyCssClass: 'subpanel',
      defaults: {
        anchor: '100%'
      },
      labelWidth: 350,
      items: [{
        title: 'Требования к обеспечению',
        xtype: 'fieldset',
        id: guarantee_id,
        layout: 'form',
        style: 'margin-top: 3px; margin-bottom: 0px;',
        defaults: {
          anchor: '100%'
        },
        labelWidth: 350,
        items: [{
          xtype: 'checkbox',
          hideLabel: true,
          boxLabel: 'Установлено требование обеспечения заявки',
          name: 'guarantee_application_set',
          id: app_guarantee_cb_id,
          checked: true,
          listeners: {
            check: guaranteeApplicationHandler,
            afterrender: guaranteeApplicationHandler
          }
        }, applic_guarantee, applic_guarantee_price, {
          xtype: 'checkbox',
          hideLabel: true,
          boxLabel: 'Установлено требование обеспечения исполнения договора',
          id: contr_guarantee_cb_id,
          name: 'guarantee_contract_set',
          listeners: {
            check: function(cb, checked) {
              var contr_guarantee = Ext.getCmp(contr_guarantee_id);
              if (checked) {
                contr_guarantee.enable();
              } else {
                contr_guarantee.disable();
              }
            }
          }
        }, contr_guarantee_slider, {
          xtype: 'checkbox',
          hideLabel: true,
          boxLabel: 'Установлено требование обеспечения возврата аванса',
          id: advance_guarantee_cb_id,
          name: 'guarantee_advance_set',
          listeners: {
            check: function(cb, checked) {
              callComponents([advance_guarantee_id, advance_guarantee_type_id], function(cmp){
                if (checked) {
                  cmp.enable();
                } else {
                  cmp.disable();
                }
              });
            }
          }
        }, {
          xtype: 'combo',
          editable: false,
          triggerAction: 'all',
          id: advance_guarantee_type_id,
          disabled: true,
          fieldLabel: 'Срок предоставления обеспечения возврата аванса',
          mode: 'local',
          displayField: 'name',
          valueField: 'id',
          store: getGuaranteeAdvanceTypesStore(),
          name: 'guarantee_advance_type'
        }, advance_guarantee, {
          xtype: 'checkbox',
          hideLabel: true,
          boxLabel: 'Установлено требование обеспечения гарантийных обязательств',
          id: warranty_guarantee_cb_id,
          name: 'guarantee_warranty_set',
          listeners: {
            check: function(cb, checked) {
              callComponents([warranty_guarantee_id, warranty_duration_id], function(cmp){
                if (checked) {
                  cmp.enable();
                } else {
                  cmp.disable();
                }
              });
            }
          }
        }, warranty_slider/*, {
          xtype: 'numberfield',
          disabled: true,
          allowNegative: false,
          minValue: 1,
          maxValue: 120,
          anchor: '60%',
          name: 'guarantee_warranty_duration',
          id: warranty_duration_id,
          fieldLabel: 'Минимальный срок гарантийных обязательств, месяцы'
        }*/,
          warranty_payments_checkbox,
          warranty_payments_slider,
          warranty_guarantee_period_checkbox,
          warranty_guarantee_period_slider
        ]
      }, {
        title: 'Требования к страхованию',
        xtype: 'fieldset',
        hidden: !Main.config.insurance_types,
        layout: 'form',
        style: 'margin-top: 3px; margin-bottom: 0px;',
        defaults: {
          anchor: '100%'
        },
        labelWidth: 350,
        items: [{
          xtype: 'checkbox',
          hideLabel: true,
          boxLabel: 'Условиями закупки предусмотрено страхование',
          id: insurance_switch_id,
          listeners: {
            check: function(cb, checked) {
              var insurance_types = Ext.getCmp(insurance_types_id);
              insurance_types.setVisible(checked);
              if (!checked) insurance_types.setValue(1);
            }
          }
        }, {
          title: 'Виды страхования',
          xtype: 'fieldset',
          layout: 'form',
          id: insurance_types_id,
          hidden: true,
          style: 'margin-top: 3px; margin-bottom: 0px;',
          defaults: {
            anchor: '100%'
          },
          name: 'insurance_types',
          setValue: function(val) {
            if (val) {
              if (val != 1) {
                Ext.getCmp(insurance_switch_id).setValue(true);
                this.setVisible(true);
              }
              setComponentValues(this, {'insurance_types[]' : val});
            }
          },
          getValue: function() {
            var v = {};
            collectComponentValues(this, v, true);
            var result = 1;
            for(var prop in v.insurance_types) {
              if (v.insurance_types.hasOwnProperty(prop)) {
                result *= v.insurance_types[prop];
              }
            }
            return result;
          },
          labelWidth: 350,
          items: [{
            xtype: 'checkbox',
            hideLabel: true,
            boxLabel: 'Страхование строительно-монтажных рисков',
            name: 'insurance_types[]',
            setValues: function(val) {
              this.setValue((val % 2 == 0 ? true : false));
            },
            getValues: function() {
              return (this.getValue() ? 2 : 1);
            }
          }, {
            xtype: 'checkbox',
            hideLabel: true,
            boxLabel: 'Страхование грузов на время транспортировки',
            name: 'insurance_types[]',
            setValues: function(val) {
              this.setValue((val % 3 == 0 ? true : false));
            },
            getValues: function() {
              return (this.getValue() ? 3 : 1);
            }
          }, {
            xtype: 'checkbox',
            hideLabel: true,
            boxLabel: 'Страхование персонала от несчастного случая',
            name: 'insurance_types[]',
            setValues: function(val) {
              this.setValue((val % 5 == 0 ? true : false));
            },
            getValues: function() {
              return (this.getValue() ? 5 : 1);
            }
          }, {
            xtype: 'checkbox',
            hideLabel: true,
            boxLabel: 'Страхование ответственности перед третьими лицами (страхование профессиональной ответственности, страхование общегражданской ответственности и т.д)',
            name: 'insurance_types[]',
            setValues: function(val) {
              this.setValue((val % 7 == 0 ? true : false));
            },
            getValues: function() {
              return (this.getValue() ? 7 : 1);
            }
          }, {
            xtype: 'checkbox',
            hideLabel: true,
            boxLabel: 'Иные виды страхования (страхование имущества, личное страхование, комплексные программы страхования)',
            name: 'insurance_types[]',
            setValues: function(val) {
              this.setValue((val % 11 == 0 ? true : false));
            },
            getValues: function() {
              return (this.getValue() ? 11 : 1);
            }
          }]
        }]
      }, {
        xtype: 'fieldset',
        hidden: !Main.config.lot_intention_notify,
        layout: 'form',
        style: 'margin-top: 10px; margin-bottom: 0px;',
        defaults: {
          anchor: '100%'
        },
        labelWidth: 350,
        items: [{
          fieldLabel: 'Уведомление о намерении принять участие',
          border: false
        }, {
          xtype: 'textarea',
          name: 'intention_notify',
          hideLabel: true
        }]
      }],
      buttons: [{
        text: 'Добавить требования к предоставляемым документам',
        hidden: !Main.config.detailed_requirements,
        handler: function() {
          component.addRequirement();
        }
      }],
      addRequirement: function(req, nolayout) {
        var cmp = new Ext.form.FieldSet(doc_req);
        if (req) {
          cmp.requirement_id = req.id;
          setComponentValues(cmp, req, true);
        }
        this.add(cmp);
        if (!nolayout) {
          this.doLayout();
        }
      },
      setValues: function(v) {
        if (v.guarantee_contract) {
          v.guarantee_contract = parseFloat(v.guarantee_contract);
        }
        if (v.guarantee_warranty) {
          v.guarantee_warranty = parseFloat(v.guarantee_warranty);
        }
        setComponentValues(this, v, true);
        Ext.getCmp(app_guarantee_cb_id).setValue(v.guarantee_application!=null);
        Ext.getCmp(contr_guarantee_cb_id).setValue(v.guarantee_contract!=null);
        Ext.getCmp(advance_guarantee_cb_id).setValue(v.guarantee_advance!=null || v.guarantee_advance_type!=null);
        Ext.getCmp(warranty_guarantee_cb_id).setValue(v.guarantee_warranty!=null || v.guarantee_warranty_text!=null);
        if (Main.config.warranty_guarantee_period) {
          Ext.getCmp(warranty_guarantee_period_cb_id).setValue(v.warranty_guarantee_period!=null);
        }
        if (Main.config.warranty_payments) {
          Ext.getCmp(warranty_payments_cb_id).setValue(v.warranty_payments!=null);
        }

        if (v.lot_doc_requirements) {
          this.items.each(function(c){
            if ('lot_doc_requirements[]' == c.name) {
              component.remove(c);
            }
          });
          for (var i=0; i<v.lot_doc_requirements.length; i++) {
            this.addRequirement(v.lot_doc_requirements[i], true);
          }
          this.doLayout();
        }
      }

    });

    if (!Main.config.detailed_requirements) {
      this.items.push({
        html: 'Преференции отдельным участникам:',
        hideLabel: true
      }, {
        xtype: 'textarea',
        allowBlank: true,
        hideLabel: true,
        height: 80,
        name: 'simple_preferences'
      }, {
        html: 'Критерии оценки заявок:',
        hideLabel: true,
        id: simple_evaluation_criteries_title_id,
        hidden: !Main.config.simple_evaluation_criteries_for_auction_down,
        disabled: !Main.config.simple_evaluation_criteries_for_auction_down
      }, {
        xtype: 'textarea',
        id: simple_evaluation_criteries_ta_id,
        allowBlank: true,
        hideLabel: true,
        height: 80,
        name: 'simple_evaluation_criteries',
        hidden: !Main.config.simple_evaluation_criteries_for_auction_down,
        disabled: !Main.config.simple_evaluation_criteries_for_auction_down
      }, {
        html: 'Дополнительная информация для заявителей:',
        hideLabel: true
      }, {
        xtype: 'textarea',
        allowBlank: true,
        hideLabel: true,
        height: 160,
        name: 'simple_requirements'
      });
    }

    this.listeners = this.listeners||{};
    Ext.apply(this.listeners, {
      procedurechanged: function(p) {
        var d = false;
        var hideItem = false;
        // наличие требований к обеспечению
        if ((!Main.config.guarantee_for_quotation && Application.models.Procedure.type_ids.quotation == p)
            || (!Main.config.guarantee_for_pricelist && Application.models.Procedure.type_ids.pricelist == p)
            || Application.models.Procedure.type_ids.qualification == p) {
          d = true;
          hideItem = true;
        }
        for (var i=0; i<no_price_ids.length; i++) {
          Ext.getCmp(no_price_ids[i]).setDisabled(d);
          Ext.getCmp(no_price_ids[i]).hidden = hideItem;
          if (hideItem) {
            Ext.getCmp(no_price_ids[i]).hide();
          } else {
            Ext.getCmp(no_price_ids[i]).show();
          }
        }
        // наличие критериев оценки
        if (!Main.config.detailed_requirements) {
          d = false;
          hideItem = false;
          if (Application.models.Procedure.type_ids.pricelist == p
              || (!Main.config.simple_evaluation_criteries_for_auction_down && Application.models.Procedure.type_ids.auction_down == p)) {
            d = true;
            hideItem = true;
          }
          for (i=0; i<no_simple_criteries.length; i++) {
            Ext.getCmp(no_simple_criteries[i]).setDisabled(d);
            Ext.getCmp(no_simple_criteries[i]).hidden = hideItem;
            if (hideItem) {
              Ext.getCmp(no_simple_criteries[i]).hide();
            } else {
              Ext.getCmp(no_simple_criteries[i]).show();
            }
          }
        }
      },
      stageschanged: function(s) {
        var r = app_parts_store.getAt(1);
        r.beginEdit();
        r.data.disabled = s<2;
        r.endEdit();
        app_parts_store.fireEvent('datachanged');
        if (s<2) {
          var v = {
            application_part: 1
          };
          this.items.each(function(i){
            if ('lot_doc_requirements[]'==i.name) {
              setComponentValues(i, v, true);
            }
          });
        }
      },
      startpricechanged: function(val) {
        this.startPrice = val;
        var cmps = [app_guarantee_id, contr_guarantee_id, advance_guarantee_id, advance_guarantee_id, warranty_guarantee_id, warranty_payments_id, warranty_guarantee_period_id];
        callComponents(cmps, function(cmp){
          if (cmp.updateRanges) {
            cmp.updateRanges(0, val);}
        });
      },
      lotpricechanged: function(checked) {
        var price = Ext.getCmp(app_guarantee_price_id);
        var slider = Ext.getCmp(app_guarantee_id);
        var s = Ext.getCmp(contr_guarantee_id);
        if (checked) {
          price.hide();
          slider.show();
      } else {
          price.show();
          slider.hide();
        }
      }
    });

    Application.components.appreqForm.superclass.initComponent.call(this);
    autoSetValue(this);
  }
});
