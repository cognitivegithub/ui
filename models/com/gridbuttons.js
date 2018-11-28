/**
 *
 * this.component - это ссылка на класс грида
 * this - это сам класс GridButtons с кнопками
 * Все хэндлеры могут меняться и поэтому прописываются в гриде а не здесь
 */

Ext.define('Application.models.GridButtons', {
    extend: 'Ext.util.Observable',
    actions: [],
    module: 'com',
    childactions: [],
    component: null,

    constructor: function (component) {
        this.component = component;

        var cmp = this.component;
//        var Status = Application.models.Procedure.statuses;
//        var childactions = this.actions?this.actions:[];


        this.actions = this.setComActions(cmp);
        this.childactions = this.setChildActions(cmp);
        this.addActions();
        Application.models.GridButtons.superclass.constructor.call(this,component);
    }
    ,setComActions: function(cmp) {
         var Status = Application.models.Procedure.statuses;
         return {
            procedure_monitoring: [
                {
                    tooltip: 'Мониторинг',
                    icon: '/ico/procedures/e_auctions.png',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        return Status.trade != l.status;
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/procedure/trade/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/trade/lot/{lot_id}/procedure/{procedure_id}'
                }
            ],
            procedure_representatives: [
                {
                    tooltip: 'Поданные заявки',
                    icon: '/ico/applics/applications.png',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        var hidden = true;
                        if (l.status < Status.applic_opened) {
                            return hidden;
                        }
                        return false;
                    },
                    handler: this.lotActionHandler('com/applic/viewapplics/lot/{lot_id}/filter/{filter}'),
                    lotHref: 'com/applic/viewapplics/lot/{lot_id}/filter/representatives'
                }
            ],
            procedure: [
                {
                    tooltip: 'Редактировать',  // Кнопка редактирования должна быть спрятана до момента публикации уже отправленных на ООС изменений
                    icon: '/ico/edit.png',
                    pseudo: 'edit',
                    isHidden: function (v, m, r) {
                        var val = calculateStatusNumber('status', r);
                        if (Main.config.disable_remote_edit && r.data.remote_id) {
                            return true;
                        }
                        return (!isCustomer()) || (r.data.organizer_contragent_id != Main.contragent.id) || val > Status.published || r.data.oos_publish_status == 1 || r.data.oos_changes_status == 1 || r.data.frm == 'peretorg';
                    },
                    text: '',
                    href: hrefAction(this.module + '/procedure/edit/id/{id}')
                },
                {
                    tooltip: 'Продление срока',
                    icon: '/ico/cron.png',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (Main.contragent
                            && r.data.organizer_contragent_id == Main.contragent.id
                            && (Main.config.prolongate_enabled && Main.config.prolongate_enabled == true)
                            && l.can_prolongate) {
                            return false;
                        }
                        return true;
                    },
                    handler: this.lotActionHandler('com/procedure/prolongate/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/prolongate/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: (Main.contragent && isCustomer())
                      ? 'Опубликовать изменения, не дожидаясь подтверждения ЕИС'
                      : 'Опубликовать, не дожидаясь подтверждения ЕИС',
                    icon: '/ico/sign.png',
                    isHidden: function (v, m, r) {
                        var val = calculateStatusNumber('status', r);
                        if (Main.config.disable_remote_edit && r.data.remote_id) {
                            return true;
                        }
                        if (isAdmin() && (r.data.oos_changes_status == 1 || r.data.oos_publish_status == 1)) return false;

                        if (Main.config.allow_customer_publish) {
                            if (isCustomer() && r.data.organizer_contragent_id == Main.contragent.id && r.data.oos_changes_status == 1) {
                                var last_update = null;
                                if (!Ext.isEmpty(r.data.date_last_update)) {
                                    last_update = r.data.date_last_update;
                                    if (last_update) {
                                        last_update = last_update.format('d.m.Y');
                                    }
                                }
                                var cur_date = new Date();
                                cur_date = cur_date.format('d.m.Y');
                                if (last_update == cur_date) {
                                    return true;
                                }
                                return false;
                            }
                            return true;
                        }
                        return (!isAdmin()) || val > Status.signed;
                    },
                    text: '',
                    scope: this,
                    handler: function (grid, rowIndex) {
                        cmp.showRegnumForm(grid.getAt(rowIndex), grid, (isCustomer()));
                    }
                },
                {
                    tooltip: 'Подписать и опубликовать',
                    icon: '/ico/sign.png',
                    isHidden: function (v, m, r) {
                        if (!Main.config.disable_remote_edit || !r.data.remote_id || !isCustomer() || r.data.organizer_contragent_id != Main.contragent.id) {
                            return true;
                        }
                        var val = calculateStatusNumber('status', r);
                        if (val == Status.published && r.data.modified) {
                            return false;
                        }
                        return val >= Status.signed;
                    },
                    text: '',
                    href: hrefAction('com/procedure/sign/procedure/{id}')
                },
                {
                    tooltip: 'Просмотреть извещение о проведении процедуры',
                    icon: '/ico/applics/announcement.png',
                    pseudo: 'view',
                    isHidden: function (v, m, r) {
                        var val = calculateStatusNumber('status', r);
                        return val < 2;
                    },
                    text: '',
                    href: hrefAction('com/procedure/view/procedure/{id}')
                },
                {
                    tooltip: 'Добавить в избранное',
                    icon: '/ico/procedures/selected_procedures.png',
                    pseudo: 'favourize',
                    isHidden: function (v, m, r) {
                        return (!Main.contragent || parseInt(r.data.favourite) || isAdmin()) ? true : false;
                    },
                    handler: function (grid, rowIndex) {
                        var item = grid.getAt(rowIndex);
                        var params = {};
                        params.procedure_id = item.id;
                        performRPCCall(RPC.Procedure.favourize, [params], null, function (result) {
                            grid.store.reload();
                            echoResponseMessage(result);
                        });
                    }
                },
                {
                    tooltip: 'Удалить из избранного',
                    icon: '/ico/procedures/delete_procedure.png',
                    pseudo: 'unfavourize',
                    isHidden: function (v, m, r) {
                        return (!Main.contragent || !parseInt(r.data.favourite) || isAdmin()) ? true : false;
                    },
                    handler: function (grid, rowIndex) {
                        var item = grid.getAt(rowIndex);
                        var params = {};
                        params.procedure_id = item.id;
                        performRPCCall(RPC.Procedure.unfavourize, [params], null, function (result) {
                            grid.store.reload();
                            echoResponseMessage(result);
                        });
                    }
                },
                {
                    tooltip: 'Взаимодействие с ЕИС',
                    icon: '/ico/oos.png',
                    isHidden: function (v, m, r) {
                        return ((Main.contragent && r.data.send_to_oos && r.data.organizer_contragent_id == Main.contragent.id) || (r.data.send_to_oos && isAdmin())) ? false : true;
                    },
                    scope: this,
                    handler: function (grid, rowIndex) {
                        cmp.showOOSEvents(grid.getAt(rowIndex));
                    }
                },
                {
                    tooltip: 'Публикация протоколов в ЕИС',
                    icon: '/images/icons/silk/door_out.png',
                    isHidden: function (v, m, r)
                    {
                        if(isPerformerInitiator() || isAdminInitiator())
                        {
                            return true;
                        }

                        var val = calculateStatusNumber('status', r);
                        var allowed = isAdmin();

                        if (!allowed) {
                            allowed = isCustomer() && (r.data.organizer_contragent_id == Main.contragent.id);
                        }
                        return !allowed || val < Status.applic_opened || r.data.oos_publish_status != 2;
                    },
                    text: '',
                    href: hrefAction('com/protocol/oosqueue/procedure/{id}')
                },
                {
                    tooltip: 'Подать запрос на разъяснение положений документации',
                    icon: '/ico/applics/request.png',
                    // lotDepends: true,
                    pseudo: 'add_explain_req',
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return (!(isSupplier() && isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, calculateStatusNumber('status', r))) || r.data.organizer_contragent_id == Main.contragent.id);
                    },
                    handler: this.lotActionHandler('com/procedure/request/type/request/procedure/{procedure_id}/lot/{lot_id}'),
                    lotHref: 'com/procedure/request/type/request/procedure/{procedure_id}/lot/{lot_id}'
                },
                {
                    tooltip: 'Запросы на разъяснение положений документации',
                    icon: '/ico/applics/request.png',
                    pseudo: 'explain_req_list',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !(isCustomer()
                            && r.data.organizer_contragent_id == Main.contragent.id
                            && r.data.request_number > 0
                            && isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, calculateStatusNumber('status', r)));
                    },
                    handler: this.lotActionHandler('com/procedure/requestlist/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/requestlist/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: 'Запросы на разъяснения положений заявок на участие',
                    icon: '/ico/applics/withdraw_applic.png',
                    pseudo: 'explain_req_applic_list',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || !isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, calculateStatusNumber('status', r)) || (Main.contragent.id != r.data.organizer_contragent_id)
                            || (r.data.application_stages == 1 && (r.data.procedure_type == Application.models.Procedure.type_ids.auction_up
                            || r.data.procedure_type == Application.models.Procedure.type_ids.auction_down));
                    },
                    handler: this.lotActionHandler('com/procedure/requestappliclist/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/requestappliclist/procedure/{procedure_id}'
                },
                {
                    tooltip: 'Подать запрос на разъяснение итогов процедуры',
                    icon: '/ico/message.png',
                    pseudo: 'add_result_req',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return (!(isSupplier() && (isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, calculateStatusNumber('status', r)) || l.status == 8)) || r.data.organizer_contragent_id == Main.contragent.id);
                    },
                    handler: this.lotActionHandler('com/procedure/requestresult/type/request/procedure/{procedure_id}/lot/{lot_id}'),
                    lotHref: 'com/procedure/requestresult/type/request/procedure/{procedure_id}/lot/{lot_id}'
                },
                {
                    tooltip: 'Протоколы разногласий',
                    icon: '/ico/message.png',
                    pseudo: 'result_req_list',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !(isCustomer()
                            && r.data.organizer_contragent_id == Main.contragent.id
                            && r.data.request_result_number > 0
                            && (isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, calculateStatusNumber('status', r)) || l.status == 8));
                    },
                    handler: this.lotActionHandler('com/procedure/requestresultlist/lot/{lot_id}'),
                    lotHref: 'com/procedure/requestresultlist/lot/{lot_id}'
                },
                {
                    tooltip: 'Подача намерения об участии',
                    icon: '/ico/applics/edit_applic.png',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        return (!isSupplierAccred() || (Main && Main.contragent && Main.contragent.id == r.data.organizer_contragent_id) || l.status != 2
                            || r.data.procedure_type != PROCEDURE_TYPE_QUOTATION_REQ || l.has_intention || !Main.config.intentions);
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/applic/makeintention/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/applic/makeintention/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: 'Заявка на участие',
                    icon: '/ico/applics/create_applic.png',
                    pseudo: 'apply',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        var hidden = true;
                        if (!isSupplier() || Main.contragent.id == r.data.organizer_contragent_id) {
                            return hidden;
                        }
                        if (Main.config.intentions && r.data.procedure_type == PROCEDURE_TYPE_QUOTATION_REQ && !l.has_intention) {
                            return hidden;
                        }

                        if (Application.models.Procedure.groups.paper_forms.indexOf(r.data.procedure_type) >= 0) {
                            return hidden;
                        }
                        if (Main.config.extended_applic_registration_quotation) {
                            if ([2, 3, 4, 6].indexOf(l.status) < 0) {
                                return hidden;
                            } else if (([3, 4, 6].indexOf(l.status) >= 0) && !l.has_published_application) {
                                return hidden;
                            } else if (false === l.extended_applic_registration) {
                                return hidden;
                            }
                        } else {
                            if (l.status != 2) {
                                return hidden;
                            }
                        }
                        return false;
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/applic/create/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/applic/create/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: 'Разослать приглашения',
                    icon: '/ico/mail.png',
                    pseudo: 'invite',
                    isHidden: function (v, m, r) {
                        if (!isAdmin()) return true;
                        if (!Main.config.categories_table) return true;
                        if (!r.data.lots || !r.data.lots.length) {
                            return true;
                        }
                        for (var i = 0; i < r.data.lots.length; i++) {
                            if (r.data.lots[i]['status'] == 2) return false;
                        }
                        return true;
                    },
                    scope: this,
                    text: '',
                    href: hrefAction('com/procedure/sendinvites/procedure/{id}')
                },
                {
                    tooltip: 'Вскрытие конвертов',
                    icon: '/ico/registry.png',
                    pseudo: 'open_applics',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || !isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, calculateStatusNumber('status', r)) || (Main.contragent.id != r.data.organizer_contragent_id)
                            || (r.data.procedure_type != Application.models.Procedure.type_ids.contest
                            && r.data.procedure_type != Application.models.Procedure.type_ids.quotation
                            && r.data.procedure_type != Application.models.Procedure.type_ids.paper_contest
                            && r.data.procedure_type != Application.models.Procedure.type_ids.paper_quotation
                            );
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/applic/openapplics/lot/{lot_id}/stage/5'),
                    lotHref: 'com/applic/openapplics/lot/{lot_id}/stage/5'
                },
                {
                    tooltip: 'Торги',
                    icon: '/ico/status3.png',
                    pseudo: 'trade',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        if (isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, calculateStatusNumber('status', r))) {
                            if (l.is_peretorg) {
                                this.tooltip = 'Переторжка';
                            } else {
                                this.tooltip = 'Торги';
                            }
                            return false;
                        } else {
                            return true;
                        }
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/procedure/trade/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/trade/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: 'События',
                    icon: '/ico/procedures/genstat.png',
                    pseudo: 'event_list',
                    isHidden: function (v, m, r) {
                        if (!Main.contragent || !r.data.lots || !r.data.lots.length) {
                            return true;
                        }
                        return false;
                    },
                    scope: this,
                    handler: function (grid, rowIndex) {
                        grid.showEvents(grid.getAt(rowIndex));
                    }
                },
                {
                    tooltip: 'Ход торгов',
                    icon: '/ico/procedures/aucstat.png',
                    pseudo: 'trade_log',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (l.status < 5
                            || !(r.data.procedure_type == Application.models.Procedure.type_ids.auction_up
                            || r.data.procedure_type == Application.models.Procedure.type_ids.auction_down
                            || r.data.procedure_type == Application.models.Procedure.type_ids.peretorg_reduc)) {
                            return true;
                        } else {
                            if (l.is_peretorg) {
                                this.tooltip = 'Ход переторжки';
                            } else {
                                this.tooltip = 'Ход торгов';
                            }
                            return false;
                        }
                    },
                    handler: function (grid, rowIndex, colIndex, gitem, e, lot) {
                        var item = grid.getAt(rowIndex);
                        if (!item || !item.data || !item.data.lots || !item.data.lots.length) {
                            return;
                        }
                        if (1 == item.data.lots.length || undefined !== lot) {
                            if (!lot) {
                                lot = 0;
                            }
                        } else {
                            cmp.expander.expandRow(rowIndex);
                        }
                    }
                },
                {
                    tooltip: 'Поданные заявки',
                    icon: '/ico/applics/applications.png',
                    pseudo: 'applic_list',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
//        var hidden = true;
//        if(Main.user.allow_view_apps) {
//          return false;
//        }
//        if (!isAdmin()) {
//          if(Main.contragent && r.data.organizer_contragent_id == Main.contragent.id && l.status<6) {
//            return hidden;
//          } else {
//           if(!Main.config.experts) {
//             return hidden;
//           } else if(!Main.user || 3!=Main.user.user_type) {
//             return hidden;
//           }
//         }
//        } else {
//           if(r.data.application_stages == 2 && l.status<6 && (r.data.procedure_type == Application.models.Procedure.type_ids.auction_up
//                || r.data.procedure_type == Application.models.Procedure.type_ids.auction_down)) {
//            return hidden;
//          }
//        }
//        return false;
                        var hidden = true;
                        if (Application.models.Procedure.groups.paper_forms.indexOf(r.data.procedure_type) >= 0) {
                            return hidden;
                        }
                        if (Main && Main.user && Main.user.affiliates && Main.user.affiliates.indexOf(r.data.organizer_contragent_id) >= 0) {
                            return false;
                        }
                        if (Main && Main.user && Main.user.allow_view_apps) {
                            return false;
                        }
                        //if (l.lot_step == LOT_STEP_PROCEDURE_CORRECTION) {
                        //  return false;
                        //}
                        if (!isAdmin()) {
                            if (Main.contragent && r.data.organizer_contragent_id == Main.contragent.id) {
                                if (l.status < 6) {
                                    return hidden;
                                }
                            } else {
                                if (!Main.config.experts) {
                                    return hidden;
                                } else if (!Main.user || TYPE_EXPERT != Main.user.user_type) {
                                    return hidden;
                                }
                            }
                        } else {
                            //if(r.data.application_stages == 2 && l.status<6 && (r.data.procedure_type == Application.models.Procedure.type_ids.auction_up
                            //  || r.data.procedure_type == Application.models.Procedure.type_ids.auction_down)) {
                            //  return hidden;
                            //}
                            if (l.status < 3) {
                                return hidden;
                            }
                        }
                    },
                    handler: this.lotActionHandler('com/applic/viewapplics/lot/{lot_id}'),
                    lotHref: 'com/applic/viewapplics/lot/{lot_id}'
                },
                {
                    tooltip: 'Журнал доступа',
                    icon: '/ico/log.png',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        if (l.show_journal === true) {
                            return false;
                        }
                        if (Main && Main.config && Main.config.procedure_access_log && Main.contragent && r.data.organizer_contragent_id == Main.contragent.id) {
                            return false;
                        }
                        return !isAdmin();
                    },
                    isHidden: cmp.isAllOf,
                    handler: function (grid, rowIndex, colIndex, gitem, e, lot) {
                        var item = grid.getAt(rowIndex);
                        if (!item || !item.data || !item.data.lots || !item.data.lots.length) {
                            return;
                        }
                        if (1 == item.data.lots.length || undefined !== lot) {
                            if (!lot) {
                                lot = 0;
                            }
                        } else {
                           cmp.expander.expandRow(rowIndex);
                        }
                    }
                },
                {
                    tooltip: 'Протоколы',
                    icon: '/ico/document.png',
                    pseudo: 'protocol_list',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        var status = calculateStatusNumber('status', r);
                        if (status == Application.models.Procedure.statuses.archive)
                            return false;
                        return !isButtonVisible(this.pseudo, l.lot_step, r.data.procedure_type, status);
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/protocol/index/lot/{lot_id}'),
                    lotHref: 'com/protocol/index/lot/{lot_id}'
                },
                {
                    tooltip: 'Рассмотреть (перерассмотреть) заявки',
                    icon: '/ico/applics/applications.png',
                    pseudo: 'review',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || !(4 == l.status || 5 == l.status || 9 == l.status) || (Main.contragent.id != r.data.organizer_contragent_id)
                            || (l.lot_step == LOT_STEP_EVALUATION);
                    },
                    handler: this.lotActionHandler('com/applic/review/lot/{lot_id}/stage/1'),
                    lotHref: 'com/applic/review/lot/{lot_id}/stage/1'
                },
                {
                    tooltip: 'Загрузить протокол проведения аукциона',
                    icon: '/ico/applics/sign_applic.png',
                    pseudo: 'trade_protocol_load',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || 6 != l.status || l.lot_step == 'prequalification' || (Main.contragent.id != r.data.organizer_contragent_id)
                            || (r.data.procedure_type != Application.models.Procedure.type_ids.auction_up
                            && r.data.procedure_type != Application.models.Procedure.type_ids.auction_down);
                    },
                    handler: this.lotActionHandler('com/applic/review/lot/{lot_id}/stage/3'),
                    lotHref: 'com/applic/review/lot/{lot_id}/stage/3'
                },
                {
                    tooltip: 'Загрузить протокол проведения переторжки',
                    icon: '/ico/applics/sign_applic.png',
                    pseudo: 'peretorg_protocol_load',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || 6 != l.status || (Main.contragent.id != r.data.organizer_contragent_id)
                            || r.data.procedure_type != Application.models.Procedure.type_ids.peretorg_reduc;
                    },
                    handler: this.lotActionHandler('com/applic/review/lot/{lot_id}/stage/4'),
                    lotHref: 'com/applic/review/lot/{lot_id}/stage/4'
                },
                {
                    tooltip: 'Подведение (переподведение) итогов',
                    icon: '/ico/registry.png',
                    pseudo: 'itog',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || !(6 == l.status || 7 == l.status) || (Main.contragent.id != r.data.organizer_contragent_id)
                            || (l.lot_step == LOT_STEP_PREQUALIFICATION)
                            || (r.data.application_stages == 1 && (r.data.procedure_type == Application.models.Procedure.type_ids.auction_up
                            || r.data.procedure_type == Application.models.Procedure.type_ids.auction_down));
                    },
                    handler: this.lotActionHandler('com/applic/review/lot/{lot_id}/stage/2'),
                    lotHref: 'com/applic/review/lot/{lot_id}/stage/2'
                },
                {
                    tooltip: 'Подведение (переподведение) итогов',
                    icon: '/ico/registry.png',
                    pseudo: 'prequalification_itog',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || !((6 == l.status || 7 == l.status) && l.lot_step == LOT_STEP_PREQUALIFICATION) || (Main.contragent.id != r.data.organizer_contragent_id);
                    },
                    handler: this.lotActionHandler('com/applic/review/lot/{lot_id}/stage/6'),
                    lotHref: 'com/applic/review/lot/{lot_id}/stage/6'
                },
                {
                    tooltip: 'Изменение итогов',
                    icon: '/ico/registry.png',
                    pseudo: 'change_itog',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !isCustomer() || !(6 == l.status || 7 == l.status) || l.lot_step == 'prequalification' || (Main.contragent.id != r.data.organizer_contragent_id)
                            || !(r.data.application_stages == 1 && (r.data.procedure_type == Application.models.Procedure.type_ids.auction_up
                            || r.data.procedure_type == Application.models.Procedure.type_ids.auction_down));
                    },
                    handler: this.lotActionHandler('com/applic/review/lot/{lot_id}/stage/2'),
                    lotHref: 'com/applic/review/lot/{lot_id}/stage/2'
                },
                {
                    tooltip: 'Договоры',
                    icon: '/ico/contracts/contracts.png',
                    pseudo: 'contract_list',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                      if (Application.models.Procedure.groups.paper_forms.indexOf(r.data.procedure_type) >= 0) {
                            return true;
                        }
                        return (!Main.config.contracts_on || l.status < 7 || l.status == 10
                            || l.winner_id === null // bug-avtodor-110
                            || (r.data.procedure_type == 5 && !Main.config.contracts_after_pricelist)
                            || (r.data.procedure_type == 4 && !Main.config.contracts_after_quotation));
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/contract/index/lot/{lot_id}'),
                    lotHref: 'com/contract/index/lot/{lot_id}'
                },
                /*{
                 tooltip: 'Продолжить процедуру',
                 icon: '/ico/play.png',
                 pseudo: 'resume',
                 isHidden: function(v, m, r) {
                 var val = calculateStatusNumber('status', r);
                 var available = (!isCustomer() || val<7 || r.frm=='peretorg' || Main.contragent.id!=r.data.organizer_contragent_id) ? true : false;
                 return available;
                 },
                 handler: redirectActionHandler('procedure/dotorg/id/{id}/frm/dotorg')
                 },*/ {
                    tooltip: 'Переторжка',
                    icon: '/ico/procedures/replay.png',
                    pseudo: 'start_peretorg_basic',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        if (Application.models.Procedure.groups.paper_forms.indexOf(r.data.procedure_type) >= 0) {
                            return true;
                        }
                        if (Main.config.peretorg_available && Main.contragent && Main.contragent.id == r.data.organizer_contragent_id) {
                            var peretorg_types = [Application.models.Procedure.type_ids.quotation,
                                Application.models.Procedure.type_ids.contest];
                            if (Main.config.peretorg_after_pricelist) {
                                peretorg_types.push(Application.models.Procedure.type_ids.pricelist);
                            }
                            if (l.status == 6 &&
                                (peretorg_types.indexOf(r.data.procedure_type) >= 0 || r.data.frm == 'peretorg')
                                && (l.active_applic_count && l.active_applic_count > 1)
                                && (!Main.config.peretorg_possible_field || (Main.config.peretorg_possible_field && r.data.peretorg_possible))) {
                                return false;
                            }
                            if (l.status == 6 &&
                                (r.data.procedure_type == Application.models.Procedure.type_ids.quotation || r.data.procedure_type == Application.models.Procedure.type_ids.pricelist || r.data.procedure_type == Application.models.Procedure.type_ids.contest)
                                && (l.active_applic_count && l.active_applic_count >= 1)
                                && (Main.config.allow_peretorg_with_one_applic)
                                && (!Main.config.peretorg_possible_field || (Main.config.peretorg_possible_field && r.data.peretorg_possible))) {
                                return false;
                            }
                        }
                        return true;
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/procedure/peretorg/procedure_id/{procedure_id}/lot_id/{lot_id}/frm/peretorg', 'Вы действительно хотите объявить переторжку по данному лоту?')
                },
                {
                    tooltip: 'Переторжка',
                    icon: '/ico/procedures/replay.png',
                    pseudo: 'start_peretorg_max',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        if (l.status == 6 &&
                            (r.data.procedure_type == Application.models.Procedure.type_ids.quotation || r.data.procedure_type == Application.models.Procedure.type_ids.pricelist || r.data.procedure_type == Application.models.Procedure.type_ids.contest)
                            && (l.active_applic_count && l.active_applic_count == 1)
                            && (Main.config.allow_peretorg_with_one_applic)
                            && (!Main.config.peretorg_possible_field || (Main.config.peretorg_possible_field && r.data.peretorg_possible))) {
                            return true;
                        }
                        if (Main.config.peretorg_available && Main.contragent && Main.contragent.id == r.data.organizer_contragent_id) {
                            var peretorg_types = [];
                            if (Main.config.peretorg_all) {
                                peretorg_types = [Application.models.Procedure.type_ids.auction_down,
                                    Application.models.Procedure.type_ids.contest,
                                    Application.models.Procedure.type_ids.quotation,
                                    Application.models.Procedure.type_ids.pricelist,
                                    Application.models.Procedure.type_ids.qualification,
                                    Application.models.Procedure.type_ids.peretorg_reduc,
                                    Application.models.Procedure.type_ids.peretorg_contest];
                            } else {
                                peretorg_types = [Application.models.Procedure.type_ids.quotation,
                                    Application.models.Procedure.type_ids.contest];
                                if (Main.config.peretorg_after_pricelist) {
                                    peretorg_types.push(Application.models.Procedure.type_ids.pricelist);
                                }
                            }
                            if (l.status == 6
                                && (peretorg_types.indexOf(r.data.procedure_type) >= 0 || r.data.frm == 'peretorg')
                                && (l.active_applic_count && l.active_applic_count < 2)
                                && (!Main.config.peretorg_possible_field || (Main.config.peretorg_possible_field && r.data.peretorg_possible))) {
                                return false;
                            }
                        }
                        return true;
                    },
                    isHidden: cmp.isAllOf,
                    handler: function () {
                        Ext.Msg.alert('Ошибка', 'Нельзя объявить переторжку с количеством участников менее двух');
                    }
                },
                {
                    tooltip: 'Вернуть процедуру на предыдущий этап',
                    icon: '/ico/procedures/replay.png',
                    pseudo: 'restore',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        //Для бумажных процедур пока нет
//        if (Application.models.Procedure.groups.paper_forms.indexOf(r.data.procedure_type) >= 0) {
//          return true;
//        }
                        return (!isAdmin() || l.status <= 2); //Только для админов
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/procedure/restore/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/restore/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: 'Удалить',
                    icon: '/ico/delete.png',
                    pseudo: 'remove',
                    isHidden: function (v, m, r) {
                        var val = calculateStatusNumber('status', r);

                        if (isAdmin()) {
                            if (r.data.lots && r.data.lots.length && r.data.frm != 'peretorg' && r.data.frm != 'dotorg') {
                                return true;
                            }
                        } else {
                            if (isCustomer()) {
                                return (Main.contragent.id != r.data.organizer_contragent_id || val > 1);
                            }
                            return !isAdmin();
                        }
                        return !isAdmin();
                    },
                    handler: function (grid, rowIndex) {
                        var confirm = new Ext.Template('Вы действительно хотите удалить процедуру «{title}»?');
                        var item = grid.getAt(rowIndex);
                        if (item) {
                            item = item.data;
                            var params = {
                                mask: true,
                                wait_text: 'Удаляется процедура',
                                confirm: confirm.apply(item)
                            };
                            performRPCCall(RPC.Procedure['delete'], [item.id], params, function (resp) {
                                echoResponseMessage(resp);
                                if (resp.success) {
                                    grid.store.reload();
                                }
                            });
                        }
                    }
                },
                {
                    tooltip: 'Отказаться от проведения процедуры',
                    icon: '/ico/stop.png',
                    pseudo: 'cancel',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (isCustomer()) {
                            if (Main.config.stop_at_any_step) {
                                // отказаться можно на любом шаге, даже если опубликовано в ЕИС
                                //в торгах и контрактах не показываем))
                                return (Main.contragent.id != r.data.organizer_contragent_id || l.status > 6 || l.status == 5);
                            } else {
                                return (Main.contragent.id != r.data.organizer_contragent_id || l.status > 4 || r.data.oos_publish_status == 1);
                            }
                        }
                        return true;
                    },
                    handler: function (grid, rowIndex, colIndex, gitem, e, lot) {
                        var data, location, confirm, i;
                        var item = grid.getAt(rowIndex);
                        if (!item || !item.data || !item.data.lots || !item.data.lots.length) {
                            return;
                        }
                        if (undefined !== lot) {
                            var cnt = 0;
                            for (i = 0; i < item.data.lots.length; i++) {
                                if (item.data.lots[i]['status'] <= 4) ++cnt;
                            }
                            cnt = item.data.lots.length;
                            if (cnt > 1) {
                                location = 'com/procedure/cancel/id/{procedure_id}/lot/{lot_id}';
                                data = {lot_id: item.data.lots[lot].id, procedure_id: item.data.id}
                            } else {
                                location = 'com/procedure/cancel/id/{procedure_id}';
                                data = {procedure_id: item.data.id}
                            }
                        } else {
                            var val = 0;
                            for (i = 0; i < item.data.lots.length; i++) {
                                val = (val > item.data.lots[i]['status'] || 10 == item.data.lots[i]['status']) ? val : item.data.lots[i]['status'];
                            }
                            if (val > 4) {
                                Ext.Msg.alert('Ошибка', 'От одного из лотов процедуры нельзя отказаться на данном этапе. Отказ от всей процедуры невозможен.');
                                return;
                            }
                            location = 'com/procedure/cancel/id/{procedure_id}';
                            data = {procedure_id: item.data.id}
                        }
                        var template = new Ext.Template(location);
                        var dst = template.apply(data);
                        confirm = 'Вы действительно хотите отказаться от проведения процедуры?';
                        Ext.Msg.confirm('Подтверждение', confirm, function (r) {
                            if ('yes' == r) {
                                redirect_to(dst);
                            }
                        });
                    }
                },
                {
                    tooltip: 'Отменить процедуру по предписанию',
                    icon: '/ico/stop.png',
                    pseudo: 'stop',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (isAdmin()) {
                            return (l.status != 7);
                        }
                        return true;
                    },
                    handler: function (grid, rowIndex, colIndex, gitem, e, lot) {
                        var data, location, i;
                        var item = grid.getAt(rowIndex);
                        if (!item || !item.data || !item.data.lots || !item.data.lots.length) {
                            return;
                        }
                        if (undefined !== lot) {
                            var cnt = 0;
                            for (i = 0; i < item.data.lots.length; i++) {
                                if (item.data.lots[i]['status'] == 7) ++cnt;
                            }
                            if (cnt > 1) {
                                location = 'com/procedure/cancel/id/{procedure_id}/lot/{lot_id}';
                                data = {lot_id: item.data.lots[lot].id, procedure_id: item.data.id}
                            } else {
                                location = 'com/procedure/cancel/id/{procedure_id}';
                                data = {procedure_id: item.data.id}
                            }
                        } else {
                            var val = true;
                            for (i = 0; i < item.data.lots.length; i++) {
                                if (7 != item.data.lots[i]['status'] && 10 != item.data.lots[i]['status']) {
                                    val = false;
                                    break;
                                }
                            }
                            if (!val) {
                                Ext.Msg.alert('Ошибка', 'Один из лотов находится не на стадии заключения договора. Отказ от всей процедуры невозможен.');
                                return;
                            }
                            location = 'com/procedure/cancel/id/{procedure_id}';
                            data = {procedure_id: item.data.id}
                        }
                        var template = new Ext.Template(location);
                        var dst = template.apply(data);
                        redirect_to(dst);
                    }
                },
                {
                    tooltip: 'Приостановить',
                    icon: '/ico/pause.png',
                    pseudo: 'pause',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (!isAdmin() &&
                            (!Main.contragent || !Main.config.allow_organizer_pause || Main.contragent.id != r.data.organizer_contragent_id)) {
                            return true;
                        }
                        return (l.status == 8 || l.status == 9 && l.status != 10);
                    },
                    handler: function (grid, rowIndex, colIndex, gitem, e, lot) {
                        var data, location, confirm;
                        var item = grid.getAt(rowIndex);
                        if (!item || !item.data || !item.data.lots || !item.data.lots.length) {
                            return;
                        }
                        if (undefined !== lot) {
                            location = 'com/procedure/pause/procedure/{procedure_id}/lot/{lot_id}';
                            confirm = 'Вы действительно хотите приостановить лот';
                            data = {lot_id: item.data.lots[lot].id, procedure_id: item.data.id}
                        } else {
                            location = 'com/procedure/pause/procedure/{procedure_id}';
                            confirm = 'Вы действительно хотите приостановить процедуру';
                            data = {procedure_id: item.data.id}
                        }
                        var template = new Ext.Template(location);
                        var dst = template.apply(data);
                        Ext.Msg.confirm('Подтверждение', confirm, function (r) {
                            if ('yes' == r) {
                                redirect_to(dst);
                            }
                        });
                    }
                },
                {
                    tooltip: 'Возобновить',
                    icon: '/ico/play.png',
                    pseudo: 'resume',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (!isAdmin() &&
                            (!Main.contragent || !Main.config.allow_organizer_pause || Main.contragent.id != r.data.organizer_contragent_id)) {
                            return true;
                        }
                        if (!l.is_resumable) return true;
                        return l.status != 9;
                    },
                    handler: this.lotActionHandler('com/procedure/resume/procedure/{procedure_id}/lot/{lot_id}'),
                    lotHref: 'com/procedure/resume/procedure/{procedure_id}/lot/{lot_id}'
                },
                {
                    tooltip: 'Перевод сроков проведения',
                    icon: '/ico/cron.png',
                    pseudo: 'change_dates',
                    // lotDepends: true,
                    scope: 'item',
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (!Main.config.change_dates_of_procedures || !Main.user.has_role_admin) return true;
                        return false;
                    },
                    handler: this.lotActionHandler('com/procedure/changedates/lot/{lot_id}'),
                    lotHref: 'com/procedure/changedates/lot/{lot_id}'
                },
                {
                    tooltip: 'Загрузить документ в состав протоколов',
                    icon: '/ico/form.png',
                    pseudo: 'add_doc_protocol',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        return (!Main.contragent || Main.contragent.id != r.data.organizer_contragent_id || l.status <= 2);
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/procedure/documentAdd/procedure/{procedure_id}/lot/{lot_id}'),
                    lotHref: 'com/procedure/documentAdd/procedure/{procedure_id}/lot/{lot_id}'
                },
                {
                    tooltip: 'Загрузить документ в извещение процедуры',
                    icon: '/ico/form.png',
                    // lotDepends: true,
                    scope: 'item',
                    isHiddenInLot: function (r, l) {
                        return (!isAdmin());
                    },
                    isHidden: cmp.isAllOf,
                    handler: this.lotActionHandler('com/procedure/operatorDocumentAdd/procedure/{procedure_id}/lot/{lot_id}'),
                    lotHref: 'com/procedure/operatorDocumentAdd/procedure/{procedure_id}/lot/{lot_id}'
                },
                {
                    tooltip: 'Эксперты',
                    icon: '/ico/roles.png',
                    isHidden: function (v, m, r) {
                        var hidden = true;
                        if (!Main.config.experts || !isCustomer()) {
                            return hidden;
                        }
                        var status = calculateStatusNumber('status', r);
                        if (!(status >= Status.published && status <= Status.second_parts)) {
                            return hidden;
                        }
                        if (Main.config.procedure_coordination) {
                            if (Main.user.department_role_id != DEPARTMENT_ROLE_HEAD) {
                                return hidden;
                            }
                            if (Main.user.department_id != r.data.organizer_department_id) {
                                return hidden;
                            }
                        } else {
                            if (Main.contragent.id != r.data.organizer_contragent_id) {
                                return hidden;
                            }
                        }
                        return false;
                    },
                    text: '',
                    href: hrefAction('com/procedure/experts/id/{id}')
                },
                {
                    tooltip: 'Рассылка приглашений',
                    icon: '/ico/mail.png',
                    isHidden: function (v, m, r) {
                        var hidden = true;
                        if (!Main.config.invitation_custom_emails) {
                            return hidden;
                        }
                        if (!Main || !Main.contragent || Main.contragent.id != r.data.organizer_contragent_id) {
                            return hidden;
                        }
                        var status = calculateStatusNumber('status', r);
                        if (status > Status.signed) {
                            return hidden;
                        }
                        return false;
                    },
                    text: '',
                    href: hrefAction('com/procedure/inviteemails/id/{id}')
                },
                {
                    tooltip: 'Нерассмотреные запросы на разъяснение положений документации',
                    text: doc_pend,
                    // lotDepends: true,
                    scope: 'item',
                    NoIcon: true,
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        return !(isCustomer()
                            && r.data.organizer_contragent_id == Main.contragent.id
                            && l.doc_explain_number > 0
                            );
                    },
                    handler: this.lotActionHandler('com/procedure/requestlist/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/requestlist/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: 'Нерассмотреные запросы на разъяснение положений заявок',
                    text: app_pend,
                    // lotDepends: true,
                    scope: 'item',
                    NoIcon: true,
                    isHidden: cmp.isAllOf,
                    isHiddenInLot: function (r, l) {
                        if (r.data.pending_applic_request_number) {
                            for (j = 0; j < r.data.pending_applic_request_number.length; j++) {
                                if (r.data.pending_applic_request_number[j]['lot_id'] == l.id) {
                                    return !(isSupplier()
                                        && r.data.pending_applic_request_number[j]['applic_request'] > 0
                                        );
                                }
                            }
                        }
                        return 1;
                    },
                    handler: this.lotActionHandler('com/procedure/requestappliclist/lot/{lot_id}/procedure/{procedure_id}'),
                    lotHref: 'com/procedure/requestappliclist/lot/{lot_id}/procedure/{procedure_id}'
                },
                {
                    tooltip: 'Добавить права доступа к этой процедуре',
                    icon: '/ico/users_list.png',
                    scope: 'item',
                    handler: function (grid, rowIndex) {
                        var item = grid.getAt(rowIndex);
                        grid.showProcedureGrantAccess(item);
                    },
                    isHidden: function (r, l) {
                        if (!isCustomerAdmin()) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
            ],
            applic: [],
            company: []
        };

        //console.log(childactions);
        //add children actions
//        if (childactions && typeof childactions == 'object'){
//            for(var key in childactions) {
//                if (childactions.hasOwnProperty(key)) {
//                    if (!this.actions[key]) {   // if no exists actions
//                        this.actions[key] = childactions[key];
//                    }else{                      // add childactions to exists actions
//                        for(var i = 0; i < childactions[key].length; i++) {
//                            this.actions[key].push(childactions[key][i]) ;
//                        }
//                    }
//                }
//            }
//        }
//
//        Application.models.GridButtons.superclass.constructor.call(this,component);
    }
    ,setChildActions: function(cmp) {
      return [];
    }
    ,addActions: function(){
      for (var type in this.childactions) {
        if (this.actions[type]) {
          for (var i = 0; i < this.childactions[type].length; i++) {
            this.actions[type].push(this.childactions[type][i]);
          }
        } else {
          this.actions[type] = this.childactions[type];
        }
      }
    }
    ,getActions: function (type) {
        return this.actions[type] ? this.actions[type] : [];
    }
    ,getAction: function (p) {
      for(var i = 0; i < this.actions.length; i++) {
          if (this.actions[i].pseudo === p) {
             return this.actions[i];
          }
      }
    },

    //общие вспомогательные функции
    lotActionHandler: function (location, confirm) {
        return function(grid, rowIndex, colIndex, gitem, e, lot) {
            var item = grid.getAt(rowIndex);
            if (!item || !item.data || !item.data.lots || !item.data.lots.length) {
                return;
            }

            if (item.data.lots.length==1 || undefined!==lot) {
                if (!lot) {
                    lot = 0;
                }
                var template = new Ext.Template(location);
                if (item) {
                    var data = {lot_id: item.data.lots[lot].id, procedure_id: item.data.id, filter: this.filter};
                    var dst = template.apply(data);
                    if (confirm) {
                        Ext.Msg.confirm('Подтверждение', confirm, function(r) {
                            if ('yes'==r) {
                                redirect_to(dst);
                            }
                        });
                    } else {
                        redirect_to(dst);
                    }
                }
            } else {
                grid.expander.expandRow(rowIndex);
                //var row = grid.getView().getRow(rowIndex).fireEvent('expand');
            }
        }
    }

});
