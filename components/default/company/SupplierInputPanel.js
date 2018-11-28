/**
 * Компонент выводит панельку для ввода информации о поставщике.
 *
 */

var supplierPanel = {
  autoHeight: true,
  editableAddressFields: false,
  initComponent: function() {
    this.panel_id = Ext.id();
    var profile_combo_id = Ext.id();
    var report_combo_id = Ext.id();
    var admitted_supplier_combo_id = Ext.id();
    
    this.ids = {
      supplier_id: Ext.id(),
      contragent_full_name: Ext.id(),
      reg_button: Ext.id(),
      inn: Ext.id(),
      kpp: Ext.id(),
      ogrn: Ext.id(),
      profile_id: Ext.id(),
      suppliers_list_id: Ext.id(),
      admitted_supplier_id: Ext.id(),
      org_type: Ext.id(),
      report_type: Ext.id(),
      admitted_supplier_type: Ext.id(),
      small_biz: Ext.id(),
      fieldset: Ext.id(),
      suppliers_list: Ext.id()
    };
    var component = this;

    this.addEvents('afterContragentSelect');
    // я извиняюсь за этот страшный копипаст чуть ниже, но трогать это без тестов и без понятия зачем приняты те или иные решения я не решился.
    var innSelect = function(innExist) {
      var innExistCheck = innExist - 0;
      var inn = Ext.getCmp(component.ids.inn).getValue();
      if (Ext.isNumber(innExistCheck)) {
        inn = innExist;
      }
      //if ((validateINN(inn) && Main.config.validate_company_inn) || !Main.config.validate_company_inn) {
        var cmpStore = getContragentStoreByInn(inn);
        cmpStore.load({
          params: {inn: inn},
          callback: function (records, options, success) {
            if (records.length > 1) {
              if (Ext.isNumber(innExistCheck)) {
                var setVal = function(id,val) {
                  var ecmp = Ext.getCmp(id);
                  if (ecmp) {
                    if (val == '') {
                      ecmp.setValue('');
                      ecmp.setReadOnly(false);
                    }else{
                      ecmp.setValue(val);
                      ecmp.setReadOnly(true);
                    }
                  }
                };
                var recordIndex = cmpStore.find('inn', innExist);
                var item = cmpStore.getAt(recordIndex);
                if ( item ) {
                  var kpp = '';
                  var full_name = '';
                  if (item.data.kpp && item.data.kpp !== null && item.data.kpp !== '') {
                    kpp = item.data.kpp;
                  }
                  full_name = item.data.full_name;
                  setVal(component.ids.kpp, kpp);
                  setVal(component.ids.contragent_full_name, full_name);
                  var sb = Ext.getCmp(component.ids.small_biz);
                  sb.setValue(item.data.small_biz);
                  var sp = Ext.getCmp(profile_combo_id);
                  if (full_name !== '') {
                    Ext.getCmp(component.ids.supplier_id).setValue(item.data.rowid);
                    Ext.getCmp(component.ids.profile_id).setValue(1);
                    sb.setDisabled(true);
                    if (sp) {
                      sp.setValue(1);
                      sp.hide();
                    }
                  } else {
                    Ext.getCmp(component.ids.supplier_id).setValue('');
                    sb.setDisabled(false);
                    if (sp) {
                      sp.setValue('');
                      sp.show();
                    }
                  }
                  var legal = Ext.getCmp('legal');
                  var postal = Ext.getCmp('postal');
                  var inn = Ext.getCmp(component.ids.inn);
                  component.resetCountryParams(legal);
                  component.resetCountryParams(postal);

                  if (item.get('address_legal') && item.get('address_legal').length > 0) {
                    legal.setValues(item.get('address_legal'));
                  }
                  if (item.get('address_postal') && item.get('address_postal') > 0) {
                    postal.setValues(item.get('address_postal'));
                  }

                  inn.setValue(innExist);
                  var ogrn = Ext.getCmp(component.ids.ogrn);
                  ogrn.setValue(item.data.ogrn);
                }
                } else
                 {
              var cmpWindowId = Ext.id();
              var cmplist_id = Ext.id();
              var cmpWindow = new Ext.Window({
                width: 550,
                closeAction: 'close',
                frame: true,
                title: 'Выбор организации',
                modal: true,
                id: cmpWindowId,
                items: [
                  {
                    layout: 'table',
                    frame: true,
                    border: false,
                    layoutConfig: {
                      columns: 2
                    },
                    items: [
                      {
                        xtype: 'combo',
                        id: cmplist_id,
                        valueField: 'rowid',
                        displayField: 'display_field',
                        fieldLabel: '',
                        hideLabel: true,
                        store: cmpStore,
                        mode: 'local',
                        typeAhead: true,
                        width: 450,
                        forceSelection: true,
                        triggerAction: 'all',
                        emptyText: 'Выберите...',
                        selectOnFocus: false
                      },
                      {
                        xtype: 'button',
                        text: 'Выбрать',
                        handler: function() {
                          var setVal = function(id,val) {
                            var ecmp = Ext.getCmp(id);
                            if (ecmp) {
                              if (val == '') {
                                ecmp.setValue('');
                                ecmp.setReadOnly(false);
                              }else{
                                ecmp.setValue(val);
                                ecmp.setReadOnly(true);
                              }
                            }
                          };
                          var selected_id = Ext.getCmp(cmplist_id).getValue();
                          var recordIndex = cmpStore.find('rowid', selected_id);
                          var item = cmpStore.getAt(recordIndex);
                          if ( item ) {
                            var kpp = '';
                            var full_name = '';
                            if (item.data.kpp && item.data.kpp !== null && item.data.kpp !== '') {
                              kpp = item.data.kpp;
                            }
                            if(selected_id !== 0) {
                              full_name = item.data.full_name;
                            }
                            setVal(component.ids.kpp,kpp);
                            setVal(component.ids.contragent_full_name,full_name);
                            var sb = Ext.getCmp(component.ids.small_biz);
                            sb.setValue(item.data.small_biz);
                            var sp = Ext.getCmp(profile_combo_id);
                            if(full_name !== '') {
                              Ext.getCmp(component.ids.supplier_id).setValue(item.data.rowid);
                              Ext.getCmp(component.ids.profile_id).setValue(1);
                              sb.setDisabled(true);
                              if (sp) {
                                sp.setValue(1);
                                sp.hide();
                              }
                            }else{
                              Ext.getCmp(component.ids.supplier_id).setValue('');
                              sb.setDisabled(false);
                              if (sp) {
                                sp.setValue('');
                                sp.show();
                              }
                            }
                            var legal = Ext.getCmp('legal');
                            var postal = Ext.getCmp('postal');
                            component.resetCountryParams(legal);
                            component.resetCountryParams(postal);
                            if (item.get('address_legal')) {
                              legal.setValues(item.get('address_legal'));
                            }
                            if (item.get('address_postal')) {
                              postal.setValues(item.get('address_postal'));
                            }

                            var ogrn = Ext.getCmp(component.ids.ogrn);
                            ogrn.setValue(item.data.ogrn);
                          } else {
                            Ext.MessageBox.alert('Ошибка!', 'Необходимо указать организацию');
                          }

                          Ext.getCmp(cmpWindowId).close();
                          component.fireEvent('afterContragentSelect', component, selected_id != 0);
                        }
                      }]
                  }]
              });
              cmpWindow.show();
            }
            } else if (records.length === 1) {
              var setVal = function(id,val) {
                var ecmp = Ext.getCmp(id);
                if (ecmp) {
                  if (val == '' || val == 'Новая организация') {
                    ecmp.setReadOnly(false);
                  }else{
                    ecmp.setValue(val);
                    ecmp.setReadOnly(true);
                  }
                }
              };
              var recordIndex = cmpStore.find('full_name', "Новая организация");
              var item = cmpStore.getAt(recordIndex);
              if ( item ) {
                var kpp = '';
                var full_name = '';
                if (item.data.kpp && item.data.kpp !== null && item.data.kpp !== '') {
                  kpp = item.data.kpp;
                }
                full_name = item.data.full_name;
                setVal(component.ids.kpp, kpp);
                setVal(component.ids.contragent_full_name, full_name);
                var sb = Ext.getCmp(component.ids.small_biz);
                sb.setValue(item.data.small_biz);
                var sp = Ext.getCmp(profile_combo_id);
                if (full_name !== '' && full_name !== "Новая организация") {
                  Ext.getCmp(component.ids.supplier_id).setValue(item.data.rowid);
                  Ext.getCmp(component.ids.profile_id).setValue(1);
                  sb.setDisabled(true);
                  if (sp) {
                    sp.setValue(1);
                    sp.hide();
                  }
                } else {
                  Ext.getCmp(component.ids.supplier_id).setValue('');
                  sb.setDisabled(false);
                  if (sp) {
                    sp.setValue('');
                    sp.show();
                  }
                }
                var legal = Ext.getCmp('legal');
                var postal = Ext.getCmp('postal');
                var inn = Ext.getCmp(component.ids.inn);
                component.resetCountryParams(legal);
                component.resetCountryParams(postal);

                if (item.get('address_legal') && item.get('address_legal').length > 0) {
                  legal.setValues(item.get('address_legal'));
                }
                if (item.get('address_postal') && item.get('address_postal') > 0) {
                  postal.setValues(item.get('address_postal'));
                }

                var ogrn = Ext.getCmp(component.ids.ogrn);
                if(item.data.ogrn){
                  ogrn.setValue(item.data.ogrn);
                }
              }
            }
          }
        });
      //} else {
      //  Ext.MessageBox.alert('Ошибка', 'Указан некорректный ИНН');
      //}
    };

    Ext.apply(this, {
      xtype: 'fieldset',
      frame: false,
      defaults: {
        anchor: '100%',
        labelWidth: 200,
        stateful: true,
        autoHeight: true,
        xtype: 'fieldset',
        layout: 'form',
        stateEvents: ['change'],
        getState: function() {
          return {
            value: this.getValue()
          };
        },
        defaults: {
          anchor: '100%',
          msgTarget: 'under'
        }
      },
     items : [
      {
        title: 'Данные об организации',
        xtype: 'fieldset',
        id: component.ids.fieldset,
        items: [
        {
          xtype: 'hidden',
          name: 'supplier_id',
          id: component.ids.supplier_id
        }
        ,{
          border: false,
          layout: 'form',
          labelWidth: 200,
          id: component.ids.report_type,
          items: [{
            xtype: 'textfield',
            hidden: true,
            fieldLabel: 'Название списка поставщиков',
            allowBlank: true,
            id: component.ids.suppliers_list_id,
            name: 'supplier_report_id'
          }]
        }
        ,{
          border: false,
          layout: 'form',
          labelWidth: 200,
          id: component.ids.admitted_supplier_type,
          items: [{
            xtype: 'textfield',
            hidden: true,
            fieldLabel: 'Поставщики',
            allowBlank: true,
            id: component.ids.admitted_supplier_id,
            name: 'admitted_supplier_id'
          }]
        }
        ,{
          xtype: 'textfield',
          name: 'inn',
          id: component.ids.inn,
          vtype: (Main.config.validate_company_inn ? 'inn' : null),
          minLength: 10,
          maxLength: 12,
          allowBlank: false,
          fieldLabel: 'ИНН'+REQUIRED_FIELD,
          listeners: {
            blur: innSelect,
            change: function() {
                component.fireEvent('innChanged', component);
            }
          }
        }
        ,{
          xtype: 'textfield',
          name: 'kpp',
          vtype: 'digits',
          minLength: 9,
          maxLength: 9,
          id: component.ids.kpp,
          fieldLabel: 'КПП',
          allowBlank: true
        },
          {
            xtype: 'textfield',
            name: 'ogrn',
            vtype: 'digits',
            allowBlank: false,
            id: component.ids.ogrn,
            fieldLabel: 'ОГРН'+REQUIRED_FIELD
          }
        ,{
          frame: false,
          border: false,
          layout: 'form',
          labelAlign: 'top',
          items: [{
            xtype: 'textfield',
            name: 'full_name',
            anchor: '100%',
            id: component.ids.contragent_full_name,
            fieldLabel: 'Полное наименование организации (Ф.И.О. для физического лица)' + REQUIRED_FIELD,
            minLength: 3,
            maxLength: 1000,
            allowBlank: false
          }]
        }
        /* телефон и адрес не вводится
        ,{
          xtype: 'Application.components.phonePanel',
          name: 'phone',
          fieldLabel: 'Телефон'+REQUIRED_FIELD
        }*/
        ,
          {
          xtype: 'fieldset',
          title: 'Юридический адрес',
          disabled: !component.editableAddressFields,
          items:[
            {
              ref: '../../addressLegal',
              xtype: 'Application.components.addressPanel',
              name: 'legal',
              id: 'legal',
              required: false,
              getValues : function() {
                var v = {};
                collectComponentValues(this, v,true);
                return v;
              }
            }
          ]
        },

        {
          xtype: 'fieldset',
          title: 'Почтовый адрес',
          disabled: !component.editableAddressFields,
          items: [
            {
              xtype: 'checkbox',
              boxLabel: 'Совпадает с юридическим',
              name: 'postaleqlegal',
              listeners: {
                check: {
                  fn: function (checkbox, checked) {
                    if (checked) {
                      var legal = this.addressLegal;
                      var postal = this.addressPostal;
                      var fields = [
                        'index', 'okato', 'region', 'city', 'settlement', 'street', 'house', 'country_iso_nr'
                      ];
                      var legal_vals = legal.getValues();
                      var postal_vals = postal.getValues();
                      var v = {
                        id: postal_vals.id ? postal_vals.id : null,
                        address_type: postal_vals.address_type ? postal_vals.address_type : null
                      };
                      for (var i = 0; i < fields.length; i++) {
                        v[fields[i]] = legal_vals[fields[i]];
                      }
                      postal.setValues(v);
                    }
                  },
                  scope: this
                }
              }
            },
            {
              ref: '../../addressPostal',
              xtype: 'Application.components.addressPanel',
              name: 'postal',
              id: 'postal',
              required: false,
              getValues : function() {
                var v = {};
                collectComponentValues(this, v,true);
                return v;
              }
            }
          ]
        }
        ,{
          border: false,
          layout: 'form',
          labelWidth: 200,
          id: component.ids.org_type,
          items: [{
            xtype: 'textfield',
            hidden: true,
            fieldLabel: 'Тип организации',
            allowBlank: false,
            id: component.ids.profile_id,
            name: 'supplier_profile_id'
          }]
        }
        ,{
          xtype: 'checkbox',
          hideLabel: true,
          boxLabel: 'Субъект малого и среднего предпринимательства',
          id: component.ids.small_biz,
          name: 'small_biz'
        }
       ]
      }
      ],
      listeners: {
        beforerender: function() {
          RPC.Company.loadprofiles('supplier', function(result) {
          var data_array = result.profiles, profileIdCmp = Ext.getCmp(profile_combo_id);

          if(profileIdCmp === undefined) {
            var supplier_profile_id = Ext.getCmp(component.ids.profile_id);

            var profileTypesCombo = {
              xtype: 'combo',
              fieldLabel: 'Тип организации'+REQUIRED_FIELD,
              mode: 'local',
              store : new Ext.data.ArrayStore({
                  id: 0,
                  fields: [
                      'id',
                      'name'
                  ],
                  data: data_array
              }),
              editable: false,
              valueField: 'id',
              displayField: 'name',
              name : component.cmptype + '_profile_id_combo',
              hiddenName : component.cmptype + '_profile_id',
              id: profile_combo_id,
              value: supplier_profile_id.getValue(),
              emptyText : 'Выберите тип организации',
              minChars : 5,
              width : 350,
              forceSelection : true,
              triggerAction: 'all',
              listeners: {
                select: function() {
                  var combo = this;
                  component.profile_id = combo.getValue();
                  Ext.getCmp(component.ids.profile_id).setValue(combo.getValue());
                }
              }
            };
            Ext.getCmp(component.ids.org_type).add(profileTypesCombo);
            component.doLayout();
          } else {
            component.profile_id = null;
            profileIdCmp.getStore().loadData(data_array);
          }
        });
        
        RPC.Protocol.loadAdmittedSuppliersList(component.lot_id, function(result) {
          var data_array_report = result.reports, reportIdCmp = Ext.getCmp(report_combo_id);
          var isVisible = result.is_visible || false;
          if (isVisible && Main.config.show_predqualification_user_list) {
            if (reportIdCmp === undefined) {
              var reportTypesCombo = {
                xtype: 'combo',
                fieldLabel: 'Списки участников',
                mode: 'local',
                store: new Ext.data.ArrayStore({
                  id: 0,
                  fields: [
                    'id',
                    'name'
                  ],
                  data: data_array_report
                }),
                editable: false,
                valueField: 'id',
                displayField: 'name',
                name: component.cmptype + '_suppliers_list_id_combo',
                hiddenName: component.cmptype + '_suppliers_list_id',
                id: report_combo_id,
                value: component.suppliers_list_id,
                emptyText: 'Выберите список поставщиков',
                minChars: 5,
                width: 350,
                forceSelection: true,
                triggerAction: 'all',
                listeners: {
                  select: function() {
                    var combo = this;
                    var suppliersListId = combo.getValue(); // lotId
                    
                    component.suppliers_list_id = suppliersListId;
                    Ext.getCmp(component.ids.suppliers_list_id).setValue(suppliersListId);

                    RPC.Protocol.loadSuppliersList(suppliersListId, function(result) {
                      var data_array_persons = result.persons;
                      var admittedSupplierIdCmp_temp = Ext.getCmp(admitted_supplier_combo_id);
                      admittedSupplierIdCmp_temp.getStore().loadData(data_array_persons);
                    });

                  }
                }
              };
              Ext.getCmp(component.ids.report_type).add(reportTypesCombo);
              component.doLayout();

              var data_array_admitted_suppliers = [], admittedSupplierIdCmp = Ext.getCmp(admitted_supplier_combo_id);

              if (admittedSupplierIdCmp === undefined) {
                var admittedSupplierCombo = {
                  xtype: 'combo',
                  fieldLabel: 'Поставщики',
                  mode: 'local',
                  store: new Ext.data.ArrayStore({
                    id: 0,
                    fields: [
                      'id',
                      'full_name',
                      'inn',
                      'kpp',
                      'supplier_profile_id',
                      'small_biz'
                    ],
                    data: data_array_admitted_suppliers
                  }),
                  editable: false,
                  valueField: 'id',
                  displayField: 'full_name',
                  name: component.cmptype + '_admitted_supplier_id_combo',
                  hiddenName: component.cmptype + '_admitted_supplier_id',
                  id: admitted_supplier_combo_id,
                  value: component.admitted_supplier_id,
                  emptyText: 'Выберите поставщика',
                  minChars: 5,
                  width: 350,
                  forceSelection: true,
                  triggerAction: 'all',
                  listeners: {
                    select: function() {
                      var combo = this;
                      var selected_id = combo.getValue();
                      selectedData = this.getStore().getById(selected_id);
                      Ext.getCmp(component.ids.inn).setValue(selectedData.data.inn);
                      
                      var kpp = '';
                      var full_name = '';
                      if (selectedData.data.kpp && selectedData.data.kpp !== null && selectedData.data.kpp !== '') {
                        kpp = selectedData.data.kpp;
                      }
                      if(selected_id !== 0) {
                        full_name = selectedData.data.full_name;
                      }
                      Ext.getCmp(component.ids.kpp).setValue(kpp);
                      Ext.getCmp(component.ids.contragent_full_name).setValue(full_name);
                      
                      var sb = Ext.getCmp(component.ids.small_biz);
                      sb.setValue(selectedData.data.small_biz);
                      var sp = Ext.getCmp(profile_combo_id);
                      if(full_name !== '') {
                        Ext.getCmp(component.ids.supplier_id).setValue(selected_id);//item.data.rowid
                        Ext.getCmp(component.ids.profile_id).setValue(1);
                        sb.setDisabled(true);
                        if (sp) {
                          sp.setValue(1);
                          sp.hide();
                        }
                      }else{
                        Ext.getCmp(component.ids.supplier_id).setValue('');
                        sb.setDisabled(false);
                        if (sp) {
                          sp.setValue('');
                          sp.show();
                        }
                      }

                    }
                  }
                };
                Ext.getCmp(component.ids.admitted_supplier_type).add(admittedSupplierCombo);

                component.doLayout();
              } else {
                component.admitted_supplier_id = null;
                admittedSupplierIdCmp.getStore().loadData(data_array_admitted_suppliers);
              }

            } else {
              component.suppliers_list_id = null;
              reportIdCmp.getStore().loadData(data_array_report);
            }

          }

        });
        
        
      }
      }
    });

    this.addListener('afterrender', function () {
      if (component.inn) {
        innSelect(component.inn)
      }
    }, this);
    Application.components.lotDataPanel.superclass.initComponent.call(this);
  },
  resetCountryParams: function (cmp) {
    if (!cmp.hasOwnProperty('field_ids')) {
      return;
    }

    var countryCombo = Ext.getCmp(cmp.field_ids.country_iso_nr);

    if (countryCombo && countryCombo.store) {

      delete countryCombo.store.baseParams[countryCombo.queryParam];
    }
  }
};

Ext.define('Application.components.SupplierInputPanel', Ext.apply({extend: 'Ext.Panel'}, supplierPanel));
