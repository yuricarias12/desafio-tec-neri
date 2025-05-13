/// <reference types="cypress" />

const dayjs = require('dayjs')



describe('Deve testar o nível funcional', () => {

    beforeEach(() => {
        cy.getToken('yuri12@hotmail.com', '2123')

        cy.resetRest()
    })

    it('Inserindo Conta', () => {
        cy.request({
            url: '/contas',
            method: 'POST',
            body: {
                nome: 'Conta via rest'
            }
            
        }).as('response')


        
        cy.get('@response').then(resposta => {

            expect(resposta.status).to.be.equal(201)
            expect(resposta.body).to.have.property('id')
            expect(resposta.body).to.have.property('nome', 'Conta via rest')
        })
    })



    it('Alterando Conta', () => {
        cy.getContaByName('Conta para alterar')
            .then(contaId => {
                cy.request({
                    url: `/contas/${contaId}`,
                    method: 'PUT',
                    body: {
                        nome: 'Conta alterada via rest'
                    }
                }).as('response')
            })

        cy.get('@response').its('status').should('be.equal', 200)
    })


    it('Inserindo Conta Repetida', () => {
        cy.request({
            url: '/contas',
            method: 'POST',
            body: {
                nome: 'Conta mesmo nome'
            },
            
            failOnStatusCode: false
        }).as('response')


        cy.get('@response').then(resposta => {
            console.log(resposta)
            expect(resposta.status).to.be.equal(400)
            expect(resposta.body.error).to.be.equal('Já existe uma conta com esse nome!')
        })

    })

    it('Inserir Movimentacao', () => {
        cy.getContaByName('Conta para movimentacoes')
            .then(contaId => {
                cy.request({
                    url: '/transacoes',
                    method: 'POST',
                    body: {
                        conta_id: contaId,
                        data_pagamento: dayjs().add(1, 'day').format('DD/MM/YYYY'),
                        data_transacao: dayjs().format('DD/MM/YYYY'),
                        descricao: "Desc",
                        envolvido: "Inter",
                        status: true,
                        tipo: "REC",
                        valor: "123"
                    }
                }).as('response')

            })

        cy.get('@response').its('status').should('be.equal', 201)
        cy.get('@response').its('body.id').should('exist')
    })

    it('Calculo de Saldo', () => {
        cy.request({
            url: '/saldo',
            method: 'GET',

        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('534.00')
        })

       
        cy.request({
            method: 'GET',
            url: '/transacoes',

            qs: {
                descricao: 'Movimentacao 1, calculo saldo'
            }
        }).then(res => {

            cy.request({
                url: `/transacoes/${res.body[0].id}`,
                method: 'PUT',
                
                body: {
                    status: true,
                    data_transacao: dayjs(res.body[0].data_transacao).format('DD/MM/YYYY'),
                    data_pagamento: dayjs(res.body[0].data_pagamento).format('DD/MM/YYYY'),
                    descricao: res.body[0].descricao,
                    envolvido: res.body[0].envolvido,
                    valor: res.body[0].valor,
                    conta_id: res.body[0].conta_id
                }
            }).its('status').should('be.equal', 200)
        })

        cy.request({
            url: '/saldo',
            method: 'GET',
           
        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('4034.00')
        })
    })

    it('Removendo Movimentacao', () => {
        cy.request({
            method: 'GET',
            url: '/transacoes',
           
            qs: {
                descricao: 'Movimentacao para exclusao'
            }
        }).then(res => {
            cy.request({
                url: `/transacoes/${res.body[0].id}`,
                method: 'DELETE',
              
            }).its('status').should('be.equal', 204)
        })
    })
})





