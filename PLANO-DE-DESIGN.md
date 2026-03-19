# Design Plan - Etapa Técnica: Pessoas, Fornecedores e Orçamentos

## Contexto

Hoje o produto já atende a parte de condomínios e unidades, mas ainda não cobre bem uma necessidade importante da operação: o processo de contratação de fornecedores.

Pelo PRD, essa etapa precisa introduzir três frentes novas no sistema: cadastro de pessoas, gestão de fornecedores e registro de orçamentos. A ideia não é só adicionar tabelas e telas, mas criar uma base que faça sentido para a operação agora e também para evoluções futuras, principalmente no reaproveitamento de pessoas em outros contextos do produto.

Além disso, o contexto atual do projeto pede uma implementação pragmática. O sistema já tem um padrão arquitetural definido, então o caminho mais seguro aqui é seguir esse padrão e evitar invenções ou refatorações grandes sem necessidade clara.

## O que foi entendido do PRD

A primeira peça desse escopo é o módulo de Pessoas. Ele deve funcionar como um cadastro global, com informações básicas e confiáveis: nome completo, CPF único, e-mail e data de nascimento. Esse cadastro não existe só por si só; ele será a base para relacionamentos com fornecedores agora e possivelmente com outros perfis no futuro.

A segunda frente é Fornecedores. O sistema precisa permitir cadastrar fornecedores com seus dados empresariais e operacionais, além de associar um ou mais contatos do tipo pessoa. Isso indica que o relacionamento entre fornecedores e pessoas não é simples de um para um, então a modelagem precisa prever esse vínculo de forma flexível.

A terceira frente é Orçamentos. Cada orçamento deve estar obrigatoriamente vinculado a um fornecedor e a um condomínio. Além disso, precisa armazenar dados de serviço, valor, categoria e status, para que a operação consiga consultar e acompanhar essas propostas no dia a dia.

Também existem requisitos de experiência que não são só detalhe visual. O PRD pede:

- consulta externa de CNPJ para ajudar no preenchimento do cadastro de fornecedor
- um aviso visível nas listagens de pessoas e fornecedores explicando a política de edição
- um checkbox obrigatório nos cadastros de pessoa e fornecedor, com o texto definido no próprio PRD

## Direção da implementação

A implementação vai seguir o padrão já usado no projeto, tanto no backend quanto no frontend. A intenção aqui é encaixar os novos módulos na estrutura existente, para manter consistência e reduzir risco.

No backend, isso significa continuar com o fluxo já conhecido de rota, controller, service e model. No frontend, significa reaproveitar o padrão já usado em condomínios: página de listagem, contexto, modal de cadastro/edição, service, contracts e tipagens.

Essa decisão importa porque reduz atrito no desenvolvimento e também facilita manutenção depois. O custo de “inventar um jeito novo” aqui seria maior do que o benefício.

## Backend

### Estrutura de dados

Serão introduzidas as entidades:

- people
- suppliers
- budgets
- supplier_people como tabela pivô para o vínculo entre fornecedores e pessoas

A modelagem precisa garantir algumas regras básicas no banco, e não apenas na aplicação:

- CPF único para pessoas
- CNPJ único para fornecedores
- orçamento sempre vinculado a fornecedor existente
- orçamento sempre vinculado a condomínio existente

Esse ponto é importante: validação só em código não basta. Se a regra é estrutural, ela precisa existir também no banco, com índice único e chave estrangeira.

### Componentes da aplicação

Seguindo o padrão do projeto, cada módulo deve ter:

- model em server/src/Models
- service em server/src/Services
- controller em server/src/Controllers
- rotas em server/src/config/routes.php
- migration em server/db/migrations

### Rotas previstas

A base da API fica assim:

- /people
- /suppliers
- /budgets

Com operações REST de listagem, detalhamento, criação, edição e exclusão onde fizer sentido dentro do escopo.

Também entra uma rota de apoio para consulta de CNPJ, algo como:

- /suppliers/cnpj/{cnpj}

A ideia dessa rota é que o frontend nunca fale direto com o provedor externo. O backend faz esse papel de intermediário, o que dá mais controle sobre tratamento de erro, padronização de resposta e troca futura de provider.

### Regras de domínio

As validações devem ficar concentradas na camada de service, como já acontece no projeto. Entre as principais regras:

- impedir CPF duplicado
- impedir CNPJ duplicado
- validar presença dos campos obrigatórios
- validar existência de supplier_id, condominium_id e pessoas vinculadas
- restringir categoria e status de orçamento a valores permitidos

Esse último ponto é relevante. Categoria e status não devem ficar soltos como texto livre, porque isso tende a gerar bagunça de dado rapidamente.

## Frontend

No frontend, os três módulos devem seguir o mesmo padrão visual e estrutural já consolidado no projeto.

### Estrutura esperada

Cada módulo deve ter:

- página de listagem
- contexto para controle de estado e carregamento
- modal de cadastro e edição
- componente de campos reutilizável
- service e contracts
- tipagens de domínio
- integração com menu e roteamento existentes

A ideia é que People, Suppliers e Budgets pareçam parte natural do sistema, e não uma área “colada” depois.

### Requisitos de experiência

Existem dois pontos do PRD que precisam aparecer claramente na interface:

- Nas listagens de pessoas e fornecedores, deve existir um aviso fixo informando que a edição de registros existentes é feita apenas pela equipe interna da Gcondo.
- Nos modais de cadastro de pessoa e fornecedor, deve existir um checkbox obrigatório com o texto:

Declaro que os dados informados são verdadeiros e estou ciente de que este registro poderá ser utilizado por outros condomínios da Gcondo.

Sem esse checkbox marcado, o cadastro não deve ser enviado.

### Fluxo de consulta de CNPJ

O comportamento esperado no cadastro de fornecedor é simples e direto:

- o usuário informa o CNPJ
- o frontend chama o endpoint interno
- os campos retornados são preenchidos automaticamente
- o usuário ainda pode ajustar os dados antes de salvar
- se a consulta falhar, o sistema mostra uma mensagem clara e permite continuar o cadastro manualmente

Esse fallback é importante porque dependência externa falha. Se o cadastro travar por causa disso, a experiência quebra.

## Decisões técnicas mais importantes

Algumas decisões aqui precisam ficar explícitas porque guiam a implementação:

### 1. Manter o padrão arquitetural atual

Nada de criar novas camadas, novos patterns ou novas abstrações sem necessidade real. O projeto já tem um jeito de funcionar, então o melhor caminho é respeitar isso.

### 2. Garantir integridade no banco e na aplicação

Unicidade e vínculos obrigatórios devem existir tanto nas validações da service quanto na estrutura do banco.

### 3. Usar relação N:N entre fornecedor e pessoa

Fornecedor pode ter mais de um contato, e a mesma pessoa pode aparecer em contextos diferentes no futuro. A tabela pivô resolve isso sem engessar a modelagem.

### 4. Tratar CNPJ pelo backend

Isso evita acoplamento do frontend com provider externo e melhora segurança, controle e consistência de resposta.

### 5. Repetir no frontend o padrão já estável de condomínios

Isso reduz risco, acelera desenvolvimento e mantém o produto coerente.

## Riscos

Os principais riscos dessa etapa são bem objetivos.

O primeiro é a dependência da consulta externa de CNPJ. Serviço externo pode ficar lento, instável ou indisponível, então a implementação precisa assumir isso desde o início.

O segundo é divergência entre frontend e backend em relação a formatos e validações, especialmente em CPF, CNPJ, obrigatoriedade de campos e listas permitidas.

O terceiro é tratar parcialmente as regras de integridade. Se a aplicação validar mas o banco não proteger, cedo ou tarde dado inconsistente entra.

Também existe o risco de o escopo crescer para uma camada mais complexa de permissão por causa do texto sobre edição pela equipe interna. Nesse momento, o mais prudente é tratar isso como orientação de experiência e alinhar se há regra real de autorização por trás.

## Estratégia de validação

A validação dessa entrega precisa cobrir banco, API, regra de negócio e interface.

No banco, é preciso garantir que as migrations criem corretamente tabelas, chaves estrangeiras, índices únicos e a tabela pivô.

Na API, é preciso validar o CRUD dos três módulos e também o comportamento da consulta de CNPJ, incluindo sucesso e falha.

Na regra de negócio, o foco é testar unicidade, obrigatoriedade de vínculos e bloqueio de valores inválidos em categoria e status.

No frontend, o principal é validar listagem, formulários, mensagens de erro, comportamento do checkbox obrigatório e exibição do aviso nas telas certas.

## Cenários mínimos de aceite

- criar pessoa com sucesso
- bloquear CPF duplicado
- criar fornecedor com uma ou mais pessoas vinculadas
- consultar CNPJ e preencher campos automaticamente
- permitir cadastro manual quando a consulta de CNPJ falhar
- criar orçamento vinculado a fornecedor e condomínio válidos
- exibir o aviso nas listagens de pessoas e fornecedores
- bloquear cadastro sem o checkbox obrigatório
- retornar erro claro quando houver vínculo inválido ou campo obrigatório ausente

## Ajuste do plano com base na implementação atual

Para refletir melhor o que já foi implementado ou definido até aqui:

- fornecedores terão criação, edição e exclusão
- orçamentos terão criação, edição e exclusão
- pessoas, nesta etapa, ficam com foco em cadastro e consulta

Ou seja, para people, o escopo atual permanece mais contido, enquanto suppliers e budgets seguem com ciclo CRUD mais completo.

## 7. Testes automatizados

Agora quero adicionar testes automatizados cobrindo os principais fluxos desta etapa, respeitando as ferramentas, padrões e estrutura do projeto atual.

### Objetivo:

Cobrir pelo menos os cenários principais:

- criação de uma pessoa
- bloqueio de CPF duplicado
- criação de fornecedor com vínculo a pessoa
- criação de orçamento com fornecedor e condomínio válidos
- cenário de falha relevante, como vínculo inválido ou campo obrigatório ausente

### Tarefas:

- Identificar a stack de testes mais compatível com o projeto atual, tanto no backend quanto no frontend, priorizando o que já existir no repositório.
- Implementar testes mínimos, mas sólidos, sem criar uma estrutura excessivamente complexa.
- Garantir que os testes sejam reproduzíveis e fáceis de executar localmente.
- Seguir os padrões já adotados no projeto para organização, nomenclatura e setup.

### Importante:

- Primeiro verificar como o projeto já lida com testes.
- Se já existir estrutura de testes, reutilizar essa base.
- Se não existir, propor e implementar a forma mais simples e consistente de adicionar testes.
- Não introduzir ferramentas novas sem necessidade clara.
- Ao final, documentar como rodar os testes.

### Escopo esperado dos testes:

- teste de criação de pessoa com sucesso
- teste de bloqueio de CPF duplicado
- teste de criação de fornecedor com vínculo válido a pessoa existente
- teste de criação de orçamento com fornecedor e condomínio válidos
- teste de erro para cenário inválido relevante, como relacionamento inexistente ou campo obrigatório ausente

### Resultado esperado:

- arquivos de teste criados na estrutura mais adequada do projeto
- cobertura dos fluxos principais desta etapa
- instruções objetivas para execução dos testes localmente
