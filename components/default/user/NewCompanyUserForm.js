/**
 * Created by Kirill on 05.03.14.
 */

Ext.define('Application.components.NewCompanyUserForm', {
    extend: 'Ext.form.Panel',
    frame : false,
    border : false,
    initComponent : function () {
        var component = this;
        var field_valid_for_id = Ext.id();
        this.ids = {
            company_id: Ext.id(),
            contragent_full_name: Ext.id(),
            reg_button: Ext.id(),
            inn: Ext.id(),
            login_username: Ext.id(),
            last_name: Ext.id(),
            first_name: Ext.id(),
            middle_name: Ext.id(),
            user_job: Ext.id(),
            user_email: Ext.id(),
            capanel: Ext.id()
        };

        var innSelect = function() {
            var inn = Ext.getCmp(component.ids.inn).getValue();
            if ((validateINN(inn) && Main.config.validate_company_inn) || !Main.config.validate_company_inn) {
                var cmpStore = getContragentStoreByInn(inn);
                cmpStore.load({params: {inn: inn}});

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
                                        var selected_id = Ext.getCmp(cmplist_id).getValue();
                                        var recordIndex = cmpStore.find('rowid', selected_id);
                                        var item = cmpStore.getAt(recordIndex);

                                        if ( item ) {
                                            full_name=item.data.full_name;
                                            if(full_name!='') {
                                                Ext.getCmp(component.ids.contragent_full_name).setValue(full_name);
                                            }
                                        } else {
                                            Ext.MessageBox.alert('Ошибка!', 'Необходимо указать организацию');
                                        }

                                        Ext.getCmp(component.ids.company_id).setValue(selected_id);
                                        Ext.getCmp(cmpWindowId).close();
                                    }
                                }]
                        }]
                });
                cmpWindow.show();
                Ext.getCmp(component.ids.reg_button).setDisabled(false);
            } else {
                Ext.MessageBox.alert('Ошибка', 'Указан некорректный ИНН');
                Ext.getCmp(component.ids.reg_button).setDisabled(true);
            }
        }

        var action = (component.act)?component.act : 'register';

        var adv_items = [];

        adv_items.push({
            xtype: 'checkbox',
            fieldLabel: 'Действует до',
            name: 'fl_valid_for',
            boxLabel: 'Без срока',
            allowBlank: true,
            scope: this,
            listeners: {
                check: function(field, status) {
                    var field_valid_for = Ext.getCmp(field_valid_for_id);
                    if (status) {
                        field_valid_for.reset();
                        field_valid_for.disable();
                    } else {
                        field_valid_for.enable();
                    }
                }
            }
        });
        adv_items.push({
            xtype: 'datefield',
            format: 'd.m.Y',
            hideLabel: false,
            id: field_valid_for_id,
            name: 'valid_for',
            anchor: 0
        });

        Ext.apply(this, {
            autoHeight: true,
            frame: true,
            layout : 'form',
            title: component.title,
            defaults: {
                anchor: '100%',
                autoHeight: true,
                allowBlank: false,
                labelWidth: 200,
                xtype: 'fieldset',
                layout: 'form',
                defaults: {
                    anchor: '100%',
                    msgTarget: 'under',
                    allowBlank: false
                }
            },
            monitorValid : true,
            items : [
                {
                    xtype: 'Application.components.CommonUserForm',
                    act: action
                },
                {
                    title: 'Данные об организации',
                    xtype: 'fieldset',
                    items: [
                        {
                            xtype: 'hidden',
                            name: 'company_id',
                            id: component.ids.company_id
                        },
                        {
                            frame: false,
                            border: false,
                            layout: 'form',
                            labelAlign: 'top',
                            items: [
                                {
                                    xtype: 'textfield',
                                    name: 'full_name',
                                    readOnly: true,
                                    anchor: '100%',
                                    id: component.ids.contragent_full_name,
                                    fieldLabel: 'Полное наименование организации'+REQUIRED_FIELD,
                                    minLength: 3,
                                    maxLength: 1000,
                                    allowBlank: false
                                }]
                        },
                        {
                            xtype: 'textfield',
                            name: 'inn',
                            id: component.ids.inn,
                            vtype: (Main.config.validate_company_inn ? 'inn' : null),
                            minLength: 10,
                            maxLength: 12,
                            fieldLabel: 'ИНН'+REQUIRED_FIELD,
                            listeners: {
                                blur: innSelect
                            }
                        }

                        ]
                },
                {
                    title: 'Данные регистрации',
                    items: adv_items,
                    style: 'margin: 10px 0 0'
                }
            ],
            buttons: [
                {
                    text: 'Отмена',
                    handler: function() {
                        history.back(1);
                    }
                },
                {
                    text: 'Регистрация',
                    scope: this,
                    id: component.ids.reg_button,
                    formBind : true,
                    handler: function(){

                        var parameters = this.getForm().getValues();
                        performRPCCall(RPC.Admin.registerCompUser, [parameters], {wait_text: 'Регистрируемся'}, function(result) {
                            if(result.success) {
                                Ext.Msg.alert('Успешно', 'Пользователь создан успешно.', function() {redirect_to('auth/login');});
                            } else {
                                echoResponseMessage(result);
                            }
                        });
                   }
                }
            ]
        });
        Application.components.NewCompanyUserForm.superclass.initComponent.call(this);
    }
});
