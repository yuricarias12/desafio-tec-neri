/// <reference types="cypress" />

import loc from '../../support/locators'
import '../../support/commandsConta'

describe('Deve testar o nível funcional', () => {
    beforeEach(() => {
        cy.visit('https://barrigareact.wcaquino.me/');
        cy.login('yuri12@hotmail.com', 2123)
        cy.resetApp()
        cy.get(loc.MENU.HOME).click()
    })

    it('Inserindo Conta', () => {
        cy.acessarMenuConta()

        cy.inserirConta('Conta de teste')

        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso!')
    })

    it('Alterando Conta', () => {
        cy.acessarMenuConta()

        cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Conta para alterar')).click()
        cy.get(loc.CONTAS.NOME)
            .clear()
            .type('Conta alterada')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso')
    })

    it('Inserindo Conta Repetida', () => {
        cy.acessarMenuConta()

        cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'code 400')
    })

    it('Inserir Movimentacao', () => {
        cy.get(loc.MENU.MOVIMENTACAO).click()

        cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Dec')
        cy.get(loc.MOVIMENTACAO.VALOR).type('123')
        cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Inter')
        cy.get(loc.MOVIMENTACAO.CONTA).select('Conta para movimentacoes')
        cy.xpath(loc.MOVIMENTACAO.XP_STATUS_CONTA).click().should('have.attr', 'title', 'Conta Paga')
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Movimentação inserida com sucesso!')

        //Verifica a quantidade de registros
        cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)

        //Verifica se o nome e o valor associado a ele existe
        cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Dec', '123,00')).should('exist')

    })

    it('Calculo de Saldo', () => {

        cy.get(loc.MENU.MOVIMENTACAO).click()

        cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Dec')
        cy.get(loc.MOVIMENTACAO.VALOR).type(12000)
        cy.get(loc.MOVIMENTACAO.INTERESSADO).type('FICR')
        cy.get(loc.MOVIMENTACAO.CONTA).select('Conta para saldo')
        cy.xpath(loc.MOVIMENTACAO.XP_STATUS_CONTA).click().should('have.attr', 'title', 'Conta Paga')
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Movimentação inserida com sucesso!')
        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Conta para saldo')).should('contain','12.534,00')
        
    })

    it('Removendo Movimentacao', () => {
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_DELETAR_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
        cy.get(loc.MENU.SETTINGS).click()
        cy.get('[href="/logout"]').click()
    })
})