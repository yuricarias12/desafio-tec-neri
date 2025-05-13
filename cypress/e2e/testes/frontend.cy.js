/// <reference types="cypress" />

import loc from '../../support/locators'
import '../../support/commandsConta'
import buildEnv from '../../support/buildEnv'

describe('Deve testar o nível funcional', () => {
    after(() => {
        cy.clearAllLocalStorage
    })
    beforeEach(() => {
        //Carrega as rotas pré definidas no arquivo buildEnv
        buildEnv()
        cy.login('yuri12@hotmail.com', 'senha errada')
        cy.get(loc.MENU.HOME).click()
    })

    it('Inserindo Conta', () => {
        cy.intercept({
            method: 'POST',
            url: '/contas'
        },
            {
                id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1
            }
        ).as('saveConta')

        cy.acessarMenuConta()
        //Trás a lista de contas sobrescrita com a conta recem salva
        cy.intercept({
            method: 'GET',
            url: '/contas'
        },
            [
                { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
                { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 },
                { id: 2, nome: 'Conta de teste', visivel: true, usuario_id: 1 },

            ]
        ).as('contasSave')

        cy.inserirConta('Conta de teste')
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
    })

    it('Alterando Conta', () => {
        
        cy.intercept({
            method: 'PUT',
            url: '/contas/**'
        },
            [
                { id: 1, nome: 'Conta alterada', visivel: true, usuario_id: 1 }
            ]
        )

        cy.acessarMenuConta()

        cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Carteira')).click()
        cy.get(loc.CONTAS.NOME)
            .clear()
            .type('Conta alterada')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso!')
    })

    it('Inserindo Conta Repetida', () => {
        cy.intercept({
            method: 'POST',
            url: '/contas'
        },
            {
                error: "Já existe uma conta com esse nome!", statusCode: 400
            }
        ).as('saveContaMesmoNome')

        cy.acessarMenuConta()

        cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'code 400')
    })

    it('Inserir Movimentacao', () => {
        cy.intercept({
            method: 'POST',
            url: '/transacoes'
        },
            {
                "id": 31433, "descricao": "asdasd", "envolvido": "sdfsdfs", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "232.00", "status": false, "conta_id": 42069, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null
            }
        )

        cy.intercept({
            method: 'GET',
            url: '/extrato/**'
        },
            { fixture: 'movimentacaoSalva.json' }
        )
        cy.get(loc.MENU.MOVIMENTACAO).click()

        cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
        cy.get(loc.MOVIMENTACAO.VALOR).type('123')
        cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Inter')
        cy.get(loc.MOVIMENTACAO.CONTA).select('Banco')
        cy.xpath(loc.MOVIMENTACAO.XP_STATUS_CONTA).click().should('have.attr', 'title', 'Conta Paga')
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Movimentação inserida com sucesso!')


        //Verifica a quantidade de registros
        cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)

        //Verifica se o nome e o valor associado a ele existe
        cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123,00')).should('exist')

    })


    it('Calculo de Saldo', () => {

        cy.intercept({
            method: 'GET',
            url: '/transacoes/**'
        },
            {
                "conta": "Conta para saldo",
                "id": 31436,
                "descricao": "Movimentacao 1, calculo saldo",
                "envolvido": "CCC",
                "observacao": null,
                "tipo": "REC",
                "data_transacao": "2019-11-13T03:00:00.000Z",
                "data_pagamento": "2019-11-13T03:00:00.000Z",
                "valor": "3500.00",
                "status": false,
                "conta_id": 42079,
                "usuario_id": 1,
                "transferencia_id": null,
                "parcelamento_id": null
            }
        )

        cy.intercept({
            method: 'PUT',
            url: '/transacoes/**'
        },
            {
                "conta": "Conta para saldo",
                "id": 31436,
                "descricao": "Movimentacao 1, calculo saldo",
                "envolvido": "CCC",
                "observacao": null,
                "tipo": "REC",
                "data_transacao": "2019-11-13T03:00:00.000Z",
                "data_pagamento": "2019-11-13T03:00:00.000Z",
                "valor": "3500.00",
                "status": false,
                "conta_id": 42079,
                "usuario_id": 1,
                "transferencia_id": null,
                "parcelamento_id": null
            }
        )

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '100,00')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1', 'calculo saldo')).click()

        cy.get(loc.MOVIMENTACAO.DESCRICAO).should('have.value', 'Movimentacao 1, calculo saldo')
        cy.xpath(loc.MOVIMENTACAO.XP_STATUS_CONTA).click().should('have.attr', 'title', 'Conta Paga')
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')

        cy.intercept({
            method: 'GET',
            url: '/saldo'
        },
            [
                { conta_id: 41735, conta: 'Carteira', saldo: 4034 },
                { conta_id: 999, conta: 'Conta com movimentacao', saldo: 5000000 }
            ]
        ).as('saldoFinal')

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '4.034,00')

    })


    it('Removendo Movimentacao', () => {
        cy.intercept({
            method: 'DELETE',
            url: '/transacoes/**'
        },
            {
                statusCode: 204
            }
        ).as('del')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_DELETAR_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    })



    it('Deve validar os dados para criar uma Conta', () => {
        const reqStub = cy.stub()
        cy.intercept({
            method: 'POST',
            url: '/contas'
        }, (req) => {
            console.log(req.headers)
            expect(req.body.nome).to.be.empty
            expect(req.headers).to.have.property('authorization')

            req.reply({ id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 })
        }
        ).as('saveConta')

        cy.acessarMenuConta()
        //Trás a lista de contas sobrescrita com a conta recem salva
        cy.intercept({
            method: 'GET',
            url: '/contas'
        },
            [
                { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
                { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 },
                { id: 2, nome: 'Conta de teste', visivel: true, usuario_id: 1 },

            ]
        ).as('contasSave')

        cy.inserirConta('{CONTROL}')

        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
    })


    it('Deve testar as cores', () => {
        
        cy.intercept({
            method: 'GET',
            url: '/extrato/**'
        },[
            { "conta": "Conta para movimentacoes", "id": 31434, "descricao": "Receita paga", "envolvido": "AAA", "observacao": null, "tipo": "REC", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1500.00", "status": true, "conta_id": 42077, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
            { "conta": "Conta com movimentacao", "id": 31435, "descricao": "Receita pendente", "envolvido": "BBB", "observacao": null, "tipo": "REC", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1500.00", "status": false, "conta_id": 42078, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
            { "conta": "Conta para saldo", "id": 31436, "descricao": "Despesa paga", "envolvido": "CCC", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "3500.00", "status": true, "conta_id": 42079, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
            { "conta": "Conta para saldo", "id": 31437, "descricao": "Despesa pendente", "envolvido": "DDD", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1000.00", "status": false, "conta_id": 42079, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
        ]
        )

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita paga')).should('have.class', 'receitaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita pendente')).should('have.class', 'receitaPendente')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa paga')).should('have.class', 'despesaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa pendente')).should('have.class', 'despesaPendente')
    })


    it('Testando responsividade da aplicação', () => {
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')
        cy.viewport(500, 700)

        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')

        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')
        cy.viewport('iphone-5')

        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')

        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')
        cy.viewport('ipad-2')

        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')
    })
})