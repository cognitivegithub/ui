/**
 * Панель адреса
 *
 * Параметры:
 *   name — название или тип адреса (по умолчанию postal), базовый name и ID у полей.
 *   Name(ID) полей считается как база плюс «[okato]»,
 *   «[index]», и т.д
 *
 *   values — значения по умолчанию, объект вида:
 *   {country_iso_nr: '643', okato: '12345678', index: '656000', city: 'default city', ...}.
 *
 */
Application.components.addressPanel = Ext.extend(Ext.Panel, {
  allowBlank: true,
  blankText: 'поле не заполнено',
  msgTarget: 'under',
  okato: null,
  index: null,
  region: null,
  city: null,
  street: null,
  fieldsToObserve: [
    'okato',
    'index',
    'region',
    'city',
    'street'
  ],
  defaults: {
    name: 'postal'
  },
  required: true,
  initComponent: function() {
    var component = this;
    var fields = [
      'index',
      'okato',
      'region',
      'city',
      'settlement',
      'street',
      'house',
      'country_iso_nr',
      'okato_block'
    ];
    var field_ids = {};
    this.field_ids = field_ids;
    for (var i=0; i < fields.length; i++) {
      field_ids[fields[i]] = Ext.id();
    }

    function formFields(country) {
      if(country == 'Россия' || country == 'Российская Федерация (РФ, Россия)') {
        component.okato = {
          ref: 'okato_id',
          id: field_ids.okato_block,
          xtype: 'compositefield',
          fieldLabel: 'Код ОКАТО',
          items: [
            {
              xtype: 'combo',
              store: createOkatoStore(),
              valueField: 'name',
              displayField: 'name',
              name: component.name + '[okato]',
              nameUI: component.name + 'Okato',
              id: field_ids.okato,
              typeAhead: false,
              emptyText: 'Введите ОКАТО',
              minChars: 3,
              pageSize: 30,
              hideTrigger: true,
              triggerAction: 'query',
              allowBlank: true,
              fieldLabel: 'Код ОКАТО',
              flex: 0.9,
              setValue: function(okato) {
                this.constructor.prototype.setValue.apply(this, arguments);
                RPC.Reference.fillByOkato(okato, function(result) {
                  var data = result.data;
                  Ext.getCmp(field_ids.region).setValue(data.region);
                  Ext.getCmp(field_ids.city).setValue(data.city);
                  Ext.getCmp(field_ids.settlement).setValue(data.settlement);
                });
              },
              listeners: {
                select : function(cmb, rec, idx) {
                  var okato = this.getValue();
                  RPC.Reference.fillByOkato(okato, function(result) {
                    var data = result.data;
                    Ext.getCmp(field_ids.region).setValue(data.region);
                    Ext.getCmp(field_ids.city).setValue(data.city);
                    Ext.getCmp(field_ids.settlement).setValue(data.settlement);
                  });
                }
              }
            },
            Application.models.Procedure.getButtonSelectTreeWnd(
              'Выбрать код ОКАТО', 'okatoList', 'code', 'Поиск по ОКАТО',
              function (n) {
                Ext.getCmp(field_ids.okato).setValue(n.code);
              },
              false
            )
          ]
        };
        component.index = {
          xtype:      'textfield',
          name:       component.name + '[index]',
          nameUI:     component.name + "Index",
          id:         field_ids.index,
          allowBlank: true,
          vtype:      'digits',
          minLength:  5,
          maxLength:  6,
          fieldLabel: 'Почтовый индекс'+ (this.required ? REQUIRED_FIELD : '')
        };
        component.region = {
          xtype:          'combo',
          fieldLabel:     'Регион/область'+ (this.required ? REQUIRED_FIELD : ''),
          store :         createZonesStore('reg',{'sokr': true}),
          valueField:     'name',
          displayField:   'name',
          name:           component.name + '[region]',
          nameUI:         component.name + "Region",
          id:             field_ids.region,
          typeAhead:      false,
          emptyText:      'Введите регион/область',
          minChars:       3,
          pageSize:       10,
          hideTrigger:    true,
          forceSelection: true,
          triggerAction:  'all',
          listeners: {
            select : function() {
              var params = {
                  region: Ext.getCmp(field_ids.region).getValue(),
                  city: Ext.getCmp(field_ids.city).getValue(),
                  settlement: Ext.getCmp(field_ids.settlement).getValue()
              };
              RPC.Reference.fillByRegion(params, function(result) {
                var data = result.data;
                if (data && data.code) {
                  Ext.getCmp(field_ids.okato).setValue(data.code);
                }

              });
            }
          }
        };
        component.city = {
          xtype:          'combo',
          fieldLabel:     'Город/район'+ (this.required ? REQUIRED_FIELD : ''),
          store:          createZonesStore('city'),
          mode:           'remote',
          valueField:     'name',
          displayField:   'name',
          name:           component.name + '[city]',
          nameUI:         component.name + "City",
          id:             field_ids.city,
          emptyText:      'Введите название города',
          minChars:       3,
          pageSize:       10,
          hideTrigger:    true,
          triggerAction:  'query',
          listeners: {
            select : function() {
              var params = {
                region: Ext.getCmp(field_ids.region).getValue(),
                city: Ext.getCmp(field_ids.city).getValue(),
                settlement: Ext.getCmp(field_ids.settlement).getValue()
              };
              RPC.Reference.fillByRegion(params, function(result) {
                var data = result.data;
                if (data && data.code) {
                  Ext.getCmp(field_ids.okato).setValue(data.code);
                }
              });
            }
          }
        };

      } else {
        component.okato = null;
        component.index = null;
        component.region = {
          xtype:      'textfield',
          name:       component.name + '[region]',
          nameUI:     component.name + "Region",
          id:         field_ids.region,
          allowBlank: true,
          fieldLabel: 'Регион/область',
          minLength:  2,
          maxLength:  255
        };
        component.city = {
          xtype:      'textfield',
          name:       component.name + '[city]',
          nameUI:     component.name + "City",
          id:         field_ids.city,
          minLength:  3,
          maxLength:  255,
          fieldLabel: 'Город/район'+ (this.required ? REQUIRED_FIELD : '')
        };
      }
      component.street = {
        xtype:      'textfield',
        name:       component.name + '[street]',
        nameUI:     component.name + "Street",
        id:         field_ids.street,
        minLength:  1,
        maxLength:  255,
        fieldLabel: 'Улица'+ (this.required ? REQUIRED_FIELD : '')
      };

    }

    var countriesCombo = {
      xtype: 'Application.components.combo',
      fieldLabel: 'Страна'+ (this.required ? REQUIRED_FIELD : ''),
      store : getCountriesStore(),
      valueField : 'iso_nr',
      hiddenName : component.name + '[country_iso_nr]',
      nameUI     : component.name + "CountryIsoNr",
      displayField : 'name',
      name : component.name + '[country_iso_nr]',
      id : field_ids.country_iso_nr,
      minChars : 2,
      pageSize : 10,
      hideTrigger : true,
      forceSelection: true,
      triggerAction: 'all',
      renderer: function(values) {
        return Ext.util.Format.countryFlag(values.alpha2||values.alpha3||values.eng_title)+' '+values.name;
      },
      listeners: {
        select : function(cmb, rec, idx) {
          formFields(this.lastSelectionText);
          for (var i = 0; i < component.fieldsToObserve.length; i++) {
            var cmp = Ext.getCmp(field_ids[component.fieldsToObserve[i]]);
            if (cmp) {
              if (component.fieldsToObserve[i] == 'okato') {
                if (Ext.getCmp(field_ids.okato_block)) {
                  Ext.getCmp(field_ids.okato_block).destroy();
                }
              } else {
                cmp.destroy();
              }
            }
          }
          formFields(this.lastSelectionText);

          for (i = 0; i < component.fieldsToObserve.length; i++) {
            if (component[component.fieldsToObserve[i]]) {
              var j = i + 1;
              if (component.fieldsToObserve[i] == 'street') {j++;}
              component.insert(j,component[component.fieldsToObserve[i]]);
            }
          }
          component.doLayout();
        }
      }
    };

    function loadData(values) {
      var cntry = Ext.getCmp(field_ids.country_iso_nr);
      if (!cntry) {
        return;
      }
      var loadCallback = function() {
        cntry.setValue(values.country_iso_nr);
        cntry.fireEvent('select');
        for (var i = 0; i < fields.length; i++) {
          if ('country'==fields[i]) {
            continue;
          }
          var cmp = Ext.getCmp(field_ids[fields[i]]);
          if (values[fields[i]] !== undefined && cmp) {
            cmp.setValue(values[fields[i]]);
          } else if (cmp && fields[i] !=='country_iso_nr') {
            cmp.setValue('');
          }
        }
      };
      if (cntry.store.find('iso_nr', values.country_iso_nr)>=0) {
        loadCallback();
      } else {
        cntry.store.load({
          callback: loadCallback,
          params:
          {
             query : values.country_iso_nr,
             queryfield : 'iso_nr'
          }
        });
      }
    }

    Ext.apply(this, {
      defaults : {
        anchor: '100%',
        cls: this.itemsCssClass,
        readOnly: this.readOnly
      },
      labelWidth: 200,
      layout: 'form',
      items:[
      countriesCombo,
      {
        xtype: 'textfield',
        name: component.name + '[settlement]',
        allowBlank: true,
        id: field_ids.settlement,
        fieldLabel: 'Населенный пункт',
        minLength: 2,
        maxLength: 255
      },
      {
        xtype: 'textfield',
        name: component.name + '[house]',
        nameUI: component.name + "House",
        allowBlank: true,
        id: field_ids.house,
        fieldLabel: 'Дом и офис'+ (this.required ? REQUIRED_FIELD : ''),
        minLength: 1,
        maxLength: 255
      }],
      loadData: loadData,
      getValues: function() {
        var v = this.values||{};
        if (Ext.isString(v)) {
          v = {};
        } else if(v.length==0) {
          v = {};
        }

        if (this.address_id) {
          v.id = this.address_id;
        }
        for (var i=0; i<fields.length; i++) {
          var cmp = Ext.getCmp(field_ids[fields[i]]);
          if (cmp && cmp.rendered) {
            var val = cmp.getValue();
            if(val && !Ext.isEmpty(val)) {
              v[fields[i]] = val;
            } else {
              v[fields[i]] = null;
            }
          }
        }
        return v;
      },
      setValues: function(v) {
        v.country_iso_nr = v.country_iso_nr||v.country;
        this.values = v;
        this.address_id = v.id;
        if (this.rendered) {
          this.loadData(v);
        } else {
          this.on('afterrender', function(){
            this.loadData(this.values);
          }, this, {once: true});
        }
      }
    });
    Application.components.addressPanel.superclass.initComponent.call(this);
    if (this.values && this.values.length>0) {
      this.setValues(this.values);
    } else {
      this.values = {};
    }
  }
});

