/**
 * @class Application.components.procedureShortView
 * @extends Ext.panel.Panel
 *
 * Просмотр извещения о проведении аукциона.
 *
 *
 */
Ext.define('Application.components.procedureShortView', {
  extend: 'Ext.panel.Panel',

  //title: 'Извещение о проведении открытого аукциона в электронной форме',
  frame: true,
  border: false,

  initComponent: function() {
    var maincmp = this;

    this.items = [
      {
        xtype             : 'Application.components.procedureViewPanel',
        //title             : 'Cведения о процедуре',
        //frame             : true,
        procedure_id      : maincmp.procedure_id,
        listeners     : {
          'dataload'  : function(procedure) {
            var procedure_status=null;
            // Здесь можно выполнить обработку данных до того, как данные растекутся по компонентам.
            if (Application.models.Procedure.groups.auctions.indexOf(procedure.procedure_type)<0) {
              procedure.offers_step_min = null;
              procedure.offers_step_max = null;
              procedure.offers_wait_time = null;
            }
            if(procedure.procedure_type == PROCEDURE_TYPE_TENDER){
              delete(this.fields.step_is_exact);
            } 
            if ((procedure.procedure_type != Application.models.Procedure.type_ids.contest
                 && procedure.procedure_type != Application.models.Procedure.type_ids.quotation
                 && procedure.procedure_type != Application.models.Procedure.type_ids.pricelist)
                  || !Main.config.peretorg_possible_field) {
              procedure.peretorg_possible = null;
            }

            if(procedure.price_increase) {
              procedure.procedure_type_vocab += ' на повышение';
            }

            if (Application.models.Procedure.groups.auctions.indexOf(procedure.procedure_type)>=0
                && Application.models.Procedure.groups.retrades.indexOf(procedure.procedure_type)<0)
            {
              var auc_subtype = ' (одноэтапный)';
              if (procedure.application_stages == 2) {
                auc_subtype = ' (двухэтапный)';
              }
              procedure.procedure_type_vocab += auc_subtype;
            }

            //console.debug(procedure);

            if (procedure.lots && procedure.lots[0]) {
              // Дата публикации
              if (procedure.lots[0]['date_published']) {
                procedure['date_published'] = procedure.lots[0]['date_published'];
                procedure_status = procedure.lots[0].status;
              }

              if(procedure_status==10 && procedure.cancel_files.length>0) {
                this.add(
                  {
                    xtype: 'Application.components.filelistPanel',
                    title: 'Извещение об отказе от проведения процедуры:',
                    cls: 'lot-documents',
                    files: procedure.cancel_files,
                    withHash: false,
                    style     : 'margin: 5px 5px 0px 5px;'
                  }
                );
                this.doLayout();
              }

              if(procedure.common_files.length>0) {
                this.add(
                  {
                    xtype: 'Application.components.filelistPanel',
                    title: 'Документация процедуры:',
                    cls: 'lot-documents',
                    files: procedure.common_files,
                    withHash: false,
                    style     : 'margin: 5px 5px 0px 5px;'
                  }
                );
                this.doLayout();
              }

              if (procedure.remote_id && procedure.lots && procedure.lots[0]) {
                this.add(
                  {
                    xtype: 'Application.components.filelistPanel',
                    title: 'Документация процедуры:',
                    cls: 'lot-documents',
                    files: procedure.lots[0].lot_documentation,
                    withHash: false,
                    style     : 'margin: 5px 5px 0px 5px;'
                  }
                );
                procedure.lots[0].lot_documentation = null;
                this.doLayout();
              }
            }
          }
        },
        procedureAutoLoad : true
      }, // Cведения о процедуре

      {
        title       : 'Сведения об организаторе',
        xtype       : 'Application.components.keyValuePanel',
        autoHeight  : true,
        style     : 'margin: 5px;',
        listeners     : {
          'dataload'  : function(data) {
            this.setValues(data, true);
          }
        },

        fields: {
          'org_full_name'         : 'Наименование организатора:',
          'org_customer_type'     : 'Тип организатора:',
          'org_main_address'      : 'Юридический адрес:',
          'org_postal_address'    : 'Почтовый адрес:',
          'contact_phone'         : 'Контактный телефон:',
          'contact_fax'           : 'Факс:',
          'contact_email'         : 'Адрес электронной почты:',
          'contact_person'        : 'Ф.И.О. контактного лица:',
          'review_applics_city'   : 'Место рассмотрения предложений'
        }
      }, // Сведения об организаторе

      {
        xtype         : 'panel',
        title         : false, // Список лотов
        frame         : false,
        border        : false,
        style         : 'margin: 0px 5px 5px 5px; border-width: 1px;',
        listeners     : {
          'dataload'  : function(data) {
            // TODO: Выдавать ошибку в этом случае?
            if (!data) return;
            // Принудительный файр подлежащей табпанели, т.к. заранее релеить нет смысла.
            this.getComponent(0).fireEvent('dataload', data);
          }
        },
        items: [{
          xtype           : 'tabpanel',
          autoHeight      : true,
          activeTab       : 0,
          id              : 'lots-list-tabpanel',
          enableTabScroll : true,
          resizeTabs      : true,
          minTabWidth     : 75,
          frame           : true,
          border          : false,
          bodyCssClass    : 'x-panel-body',
          bodyStyle       : 'padding: 0 5px 10px',
          items           : [],
          listeners       : {
            'dataload'  : function(data) {

              var component = this;
              var lots = data.lots;
              var lotFields = Application.models.Lot.getLotFields(data.procedure_type);

              var lotTemplates = Application.models.Lot.getLotTemplates();

              for (var i = 0; i < lots.length; i++) {
                // making closure
                (function(j) {
                var lot = lots[j];
                var items = Application.models.Lot.getLotPanelItems(lot, data, lotFields, lotTemplates);

                component.add({
                  title       : 'Лот',
                  tabTip      : lot.subject,
                  xtype       : 'panel',
                  autoHeight  : true,
                  items       : items,
                  tbar        : {
                    items       : [{
                      xtype       :'buttongroup',
                      // Не показывать кнопку организатору
                      // Не показывать кнопку заказчикам (если они при этом не являются поставщиками)
                      // Скрыть кнопку подачи если текущая дата позднее, чем date_end_registration
                      hidden      : (data.organizer_contragent_id == Main.user.contragent_id) ||
                                    isAdmin() ||
                                    ( !isSupplier() && isCustomer() ) ||
                                    ( (parseDate(lot.date_end_registration)||0) - now() ) < 0 ||
                                    lot.status > 2,
                      items       : [{
                        xtype       : 'button',
                        scale       : 'medium',
                        iconCls     : 'new-applic24',
                        tooltip     : 'Подать заявку на участие',
                        text        : 'Подать заявку на участие',
                        handler     : function() {
                          redirect_to(String.format( 'com/applic/create/lot/{0}/procedure/' + maincmp.procedure_id, lot.id ) );
                        }
                      }]
                    }]
                  } // tbar config
                }); // component.add
                })(i);
              } // each lots

              if (lots.length > 0)
                component.setActiveTab(0);
            } // dataload lots

          } // listeners for tabpanel

        }] // tabpanel configuration
      } // Панель списка лотов


    ]; // procedureShortView items

    // alena 3721 возможность добавить разл.кнопки в контроллере -->--
    var buttons = [];
    if (undefined !== this.buttons) {
      if (Ext.isArray(this.buttons)) {
        buttons.push.apply(buttons, this.buttons);
      } else {
        buttons.push(this.buttons);
      }
    }else{ // или отобразить одну кнопку по умолчанию --<-- alena 3721
    this.buttons = [
      {
        text: 'История изменений',
        handler: function() {
          redirect_to('com/procedure/history/procedure/'+maincmp.procedure_id);
        }
      }
    ];
    } // -- alena 3721
    this.on('beforerender', function() {
      // Релеим событие загрузки данных родлежащим компонентам
      // от первого, Application.components.procedureViewPanel
      var procedureViewPanel = this.getComponent(0);
      this.items.each(function(item, index) {
        if (index == 0) return;
        //item.addEvents('dataload');
        item.relayEvents(procedureViewPanel, ['dataload']);
      });
    }, this);

    Application.components.procedureShortView.superclass.initComponent.call(this);
  }
});
