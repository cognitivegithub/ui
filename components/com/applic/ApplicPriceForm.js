/**
 * Прайсфилд для заявок ФСК - редактирование и отображение информации о цене
 */
Application.components.ApplicPriceForm = Ext.extend(Ext.form.FieldSet, {
  title: this.title || 'Цена предложения',
  style: 'margin: 5px;',
  defaults: {
    anchor: '100%'
  },
  layout: 'form',
  labelWidth: 400,
  initComponent: function() {
    var component = this;
    this.ids = initIds(['price', 'price_no_nds', 'nds_percent_id', 'nds_checkbox_id', 'minimal_price_id']);

    var showPriceNoNds = Main.config.applic_show_price_no_nds,
        minPriceRequired = Main.config.minimal_price_required,
        ndsFromProc = Main.config.nds_from_procedure,
        showNdsPercentField=Main.config.show_nds_percent;

    var priceAllowBlank = '';
    var priceStyle = null;
    if (!component.noneditable) {
      priceAllowBlank = REQUIRED_FIELD;
    } else {
      priceStyle = 'background: transparent; border: none;';
    }

    Ext.apply(this, {
      readOnly: component.noneditable,
      items: [
        {
          xtype: 'Application.components.priceField',
          name: 'price',
          id: this.ids.price,
          allowBlank: false,
          readOnly: component.noneditable,
          style: priceStyle,
          fieldLabel: 'Цена предложения в валюте начальной цены договора с НДС' + priceAllowBlank,
          listeners: {
            change: function(field, newVal) {
              if (showPriceNoNds && newVal) {
                var start_price_no_nds_cmp = Ext.getCmp(component.ids.price_no_nds);
                var nds_percent_cmp = Ext.getCmp(component.ids.nds_percent_id);
                var start_price = parsePrice(newVal);
                var nds_percent = parsePrice(nds_percent_cmp.getValue());
                if (nds_percent) {
                  var start_price_no_nds = (start_price * 100) / (100 + nds_percent);
                  start_price_no_nds_cmp.setValue(start_price_no_nds);
                }
              }
            }
          }
        }, {
          xtype: 'Application.components.priceField',
          name: 'price_no_nds',
          id: this.ids.price_no_nds,
          allowBlank: false,
          readOnly: component.noneditable,
          disabled: !showPriceNoNds,
          hidden: !showPriceNoNds,
          style: priceStyle,
          fieldLabel: 'Цена предложения в валюте начальной цены договора без НДС' + priceAllowBlank,
          listeners:{
            change: function(field, newVal) {
              if (showPriceNoNds && newVal) {
                var start_price_cmp = Ext.getCmp(component.ids.price);
                var nds_percent_cmp = Ext.getCmp(component.ids.nds_percent_id);
                var start_price_no_nds = parsePrice(newVal);
                var start_price = parsePrice(start_price_cmp.getValue());
                if (start_price && start_price_no_nds) {
                  var nds_percent = Math.round((start_price * 100) / start_price_no_nds - 100);
                  nds_percent_cmp.setValue(nds_percent);
                }
              }
            }
          },
          setValues: function(val) {
            this.fireEvent('change', this, val);
          }
        }, {
          xtype: 'Application.components.priceField',
          name: 'minimal_price',
          id: component.ids.minimal_price_id,
          allowBlank: false,
          readOnly: component.noneditable,
          hidden: !minPriceRequired,
          disabled: !minPriceRequired,
          style: priceStyle,
          fieldLabel: 'Цена безубыточности в валюте начальной цены договора' + priceAllowBlank
        }, {
          xtype: 'panel',
          border: false,
          layout: 'form',
          labelWidth: 400,
          defaults: {
            anchor: '100%'
          },
          frame: false,
          items: [{
            xtype: 'checkbox',
            id: component.ids.nds_checkbox_id,
            name: 'price_with_vat',
            fieldLabel: (showNdsPercentField)? 'Ценовые предложения подаются с учетом НДС':'С учетом НДС',
            disabled: component.noneditable||ndsFromProc,
            hidden: ndsFromProc,
            checked: true,
            listeners: {
              check: function(obj, v) {
                if (component.noneditable) {
                  this.setVisible(v);
                }
                var nds_percent = Ext.getCmp(component.ids.nds_percent_id);
                if (!(ndsFromProc && showPriceNoNds) && nds_percent) {
                  nds_percent.setVisible(v);
                  nds_percent.setDisabled(!v);
                }
              },
              valueFilled: function(v) {
                var nds_percent = Ext.getCmp(component.ids.nds_percent_id);
                if (!(ndsFromProc && showPriceNoNds) && nds_percent) {
                  nds_percent.setVisible(v);
                  nds_percent.setDisabled(!v);
                }
              }
            }
          }, {
            xtype: 'numberfield',
            name: 'nds_percent',
            id: component.ids.nds_percent_id,
            fieldLabel: 'Размер НДС(%)',
            style: (component.noneditable || (ndsFromProc && showPriceNoNds) ? priceStyle : null),
            readOnly: (ndsFromProc && showPriceNoNds) ? true : component.noneditable,
            allowBlank: ndsFromProc ? true : false,
            value: 18,
            getValues: function() {
              if (this.getValue()) return this.getValue();
              var start_price_cmp = Ext.getCmp(component.ids.price);
              var start_price = parsePrice(start_price_cmp.getValue());
              var start_price_no_nds_cmp = Ext.getCmp(component.ids.price_no_nds);
              var start_price_no_nds = parsePrice(start_price_no_nds_cmp.getValue());
              var nds = 0;
              if (start_price && start_price_no_nds) {
                nds = Math.round((start_price * 100) / start_price_no_nds - 100);
              }
              return nds;
            },
            setValues: function(val) {
              if (/*component.noneditable ||*/ (ndsFromProc && showPriceNoNds)
                    && this.getValue() && !val) {
                // в случае просмотра заявки, если значение процента НДС уже вычислено, но
                // из данных заявки это поле приходит null, то не даем затереть вычисленное значение
                return;
              }
              this.setValue(val);
            }
          }]
        }
      ],
      listeners: {
        lotloaded: function(v) {
          this.procedure_type = v.procedure_type;
          this.lot_data = v.lot;
          this.prequalification_finished = !v.with_prequalification || v.lot.prequalification_finished;
          if(ndsFromProc) {
            if(v.lot.nds_percent) {
              Ext.getCmp(this.ids.nds_percent_id).setValue(v.lot.nds_percent);
            }
          }

          var showPriceField = this.prequalification_finished && Application.models.Procedure.groups.price_requested.indexOf(this.procedure_type)>=0;
          if(!showPriceField) {
            this.disable();
            this.hide();
          }
        },
        applicloaded: function(applic) {
          this.applic = applic;
        }
      }
    });

    Application.components.ApplicPriceForm.superclass.initComponent.call(this);
  },
  validate: function() {
    var price;
    var activate_validation = this.prequalification_finished && Application.models.Procedure.groups.price_requested.indexOf(this.procedure_type)>=0;
    if(activate_validation) {
      if (Application.models.Procedure.groups.price_requested.indexOf(this.procedure_type) >=0 ) {
        if (!((this.procedure_type == PROCEDURE_TYPE_QUOTATION_REQ || this.procedure_type == PROCEDURE_TYPE_TENDER)
          && !this.lot_data.start_price && this.lot_data.no_price_reason)
          ) {
          price = Ext.getCmp(this.ids.price);
          if (this.lot_data.start_price && price && price.getValue() > this.lot_data.start_price) {
            return {success:false, msg: 'Цена предложения превышает начальную максимальную цену лота, указанную в извещении', fatal: true};
          }
        }
      }
    }
    return true;
  }
});