# Mini PRD

## Resumo

Hoje o produto cobre operações básicas de condomínios e unidades, mas ainda não resolve a necessidade central da operação: gestão de contratação de fornecedores.

Este **PRD** define o conceito de **Pessoas** e o conceito de **Fornecedores e orçamentos** como frentes complementares para reduzir trabalho manual e melhorar a rastreabilidade da operação.

## Objetivo do produto

Melhorar a operação do condomínio ao estruturar o ciclo de fornecedores e orçamentos para apoiar decisões de contratação, com cadastro central de pessoas para vínculo com fornecedores e futuramente moradores.

## Metas da entrega

- Permitir registrar e consultar pessoas no sistema para uso em outros contextos (ex.: vínculo com fornecedores).
- Permitir organizar fornecedores e seus contatos relacionados.
- Permitir registrar e acompanhar orçamentos associados a fornecedores e condomínios.
- Tornar essas informações fáceis de consultar no dia a dia operacional.
- Reduzir retrabalho manual e perda de contexto entre áreas.

## Não objetivos

- Não cobrir fluxo financeiro completo (pagamento, conciliação e faturamento).
- Não cobrir assinatura de contrato, fluxo jurídico ou aprovação multinível.
- Não cobrir comunicação externa automatizada (*e-mail*, *WhatsApp*) nesta fase.
- Não cobrir aplicativo móvel dedicado nesta fase.

## Épico 1: Pessoa

### Problema

Hoje não existe um cadastro central de pessoas, reutilizável em mais de um contexto.

### Objetivo do épico

Criar o conceito de pessoa no sistema, com dados básicos e regras de unicidade, além de ser independente da funcionalidade de fornecedor do épico 2.

Uma mesma pessoa pode trabalhar em vários fornecedores. Além disso, no futuro, essa mesma pessoa pode ser moradora de um condomínio, quando esse conceito de morador for criado.

### Dados esperados de pessoa

Campos obrigatórios nesta etapa:

1. Nome completo.
2. CPF.
3. E-mail.
4. Data de nascimento.

Regras de operação:

1. Pessoas pertencem ao sistema.
2. Condomínios podem criar registros de pessoa.
3. Edição de registros de pessoa já existentes é feita apenas pela equipe interna da Gcondo.
4. O CPF deve ser único no sistema.

### Histórias de usuário

1. Como pessoa da operação, quero cadastrar pessoas para utilizá-las no vínculo com fornecedores e em outros contextos futuros.
2. Como pessoa da operação, quero consultar pessoas cadastradas no sistema para localizar contatos e reutilizar em novos cadastros.

### Indicadores de sucesso do épico

1. A equipe consegue cadastrar e consultar pessoas e utilizá-las no vínculo com fornecedores.
2. Não há cadastro duplicado de mesma pessoa (CPF único em uso).
3. O cadastro de pessoas passa a ser a referência para contatos vinculados a fornecedores.

## Épico 2: Fornecedores e orçamentos

### Problema

A gestão de fornecedores e propostas é dispersa, com baixa padronização e dificuldade para comparar opções por condomínio.

### Objetivo do épico

Estruturar um fluxo mínimo de fornecedores e orçamentos para apoiar decisão e histórico de contratação.

### Dados esperados de fornecedor

Campos obrigatórios nesta etapa:

1. Razão social.
2. Nome fantasia.
3. CNPJ.
4. E-mail.
5. CEP.
6. Endereço.
7. Categoria.

O fornecedor deve permitir vínculo com uma ou mais pessoas.

Regra de operação:

1. Fornecedores pertencem ao sistema.
2. Condomínios podem criar registros de fornecedor.
3. Edição de registros de fornecedor já existentes é feita apenas pela equipe interna da Gcondo.
4. Todos os condomínios têm acesso aos fornecedores cadastrados.

Categorias de fornecedor:

1. Manutenção predial.
2. Limpeza e conservação.
3. Segurança e portaria.
4. Elétrica e hidráulica.
5. Obras e reformas.
6. Administrativo e outros.

### Dados esperados de orçamento

Campos obrigatórios nesta etapa:

1. Fornecedor vinculado.
2. Condomínio vinculado.
3. Título.
4. Descrição do serviço.
5. Valor.
6. Categoria.
7. Status.

Categorias de orçamento:

1. Manutenção preventiva.
2. Manutenção corretiva.
3. Obra ou reforma.
4. Contratação recorrente.
5. Compra pontual.

Categorias de status:

1. Rascunho.
2. Enviado.
3. Em análise.
4. Aprovado.
5. Reprovado.
6. Cancelado.

### Integração externa para CNPJ

O sistema deve permitir consulta externa de CNPJ para ajudar no preenchimento inicial dos dados no cadastro de fornecedor.

Esta integração é obrigatória nesta etapa.

Serviços sugeridos para consulta no teste:

1. BrasilAPI (alternativa).
2. ReceitaWS (preferencial).
3. Em último caso, outras ferramentas podem ser utilizadas.

Resultado esperado:

1. Buscar dados do CNPJ informado.
2. Pré-preencher automaticamente os campos disponíveis.
3. Permitir edição manual dos dados antes de salvar.
4. Exibir mensagem clara quando a consulta externa falhar, orientando a tentar novamente.

### Requisitos de experiência para pessoas e fornecedores

1. Na tela de listagem de pessoas e fornecedores, exibir aviso claro de que a edição de registros existentes é feita apenas pela equipe interna da Gcondo.
2. No modal de cadastro de pessoa e no modal de cadastro de fornecedor, incluir caixa de seleção obrigatória com o texto:
   - *"Declaro que os dados informados são verdadeiros e estou ciente de que este registro poderá ser utilizado por outros condomínios da Gcondo."*

### Histórias de usuário

1. Como pessoa da operação, quero cadastrar fornecedores para manter uma base de parceiros confiável.
2. Como pessoa da operação, quero associar pessoas a fornecedores para saber com quem falar em cada empresa.
3. Como pessoa da operação, quero registrar orçamentos ligados a fornecedor e condomínio para comparar alternativas.
4. Como coordenação, quero consultar orçamentos por condomínio para acompanhar decisões com contexto.

### Indicadores de sucesso do épico

1. Orçamentos deixam de ficar espalhados em canais informais.
2. O histórico básico de propostas por condomínio fica acessível.
3. A decisão de contratação ganha mais transparência.

