const buildEnv = () => {
    //Criando uma rota para simular uma rota real do barrigareact
    //Faz um login
    cy.intercept({
        method: 'POST',
        url: '/signin'
    },
        { id: 1000, nome: 'Usuario falso', token: 'Uma string muito grande que nao deveria passar mas, vai' }
    ).as('signin')


    cy.intercept({
        method: 'GET',
        url: '/saldo'
    },
        [
            { conta_id: 41735, conta: 'Carteira', saldo: 100 },
            { conta_id: 999, conta: 'Conta com movimentacao', saldo: 5000000 }
        ]
    ).as('saldo')

    //Exibe as contas na tela
    cy.intercept({
        method: 'GET',
        url: '/contas'
    },
        [
            { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
            { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 },

        ]
    ).as('contas')


    cy.intercept({
        method: 'GET',
        url: '/extrato/**'
    },[
        { "conta": "Conta para movimentacoes", "id": 31434, "descricao": "Movimentacao para exclusao", "envolvido": "AAA", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1500.00", "status": true, "conta_id": 42077, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
        { "conta": "Conta com movimentacao", "id": 31435, "descricao": "Movimentacao de conta", "envolvido": "BBB", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1500.00", "status": true, "conta_id": 42078, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
        { "conta": "Conta para saldo", "id": 31436, "descricao": "Movimentacao 1, calculo saldo", "envolvido": "CCC", "observacao": null, "tipo": "REC", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "3500.00", "status": false, "conta_id": 42079, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
        { "conta": "Conta para saldo", "id": 31437, "descricao": "Movimentacao 2, calculo saldo", "envolvido": "DDD", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1000.00", "status": true, "conta_id": 42079, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
        { "conta": "Conta para saldo", "id": 31438, "descricao": "Movimentacao 3, calculo saldo", "envolvido": "EEE", "observacao": null, "tipo": "REC", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "1534.00", "status": true, "conta_id": 42079, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
        { "conta": "Conta para extrato", "id": 31439, "descricao": "Movimentacao para extrato", "envolvido": "FFF", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-220.00", "status": true, "conta_id": 42080, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null }
    ]
    )
}

export default buildEnv