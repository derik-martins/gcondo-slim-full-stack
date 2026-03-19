# Design Plan - Etapa Técnica (Pessoas, Fornecedores e Orçamentos)

## 1. O que foi entendido do PRD

O produto já cobre condomínios e unidades, mas precisa evoluir para suportar o ciclo operacional de contratação.

Nesta etapa, o sistema deve incluir três novos módulos de domínio:

1. Pessoas: cadastro global com nome completo, CPF único, e-mail e data de nascimento.
2. Fornecedores: cadastro global com dados empresariais e operacionais, incluindo vínculo com uma ou mais pessoas.
3. Orçamentos: registro de propostas vinculadas obrigatoriamente a fornecedor e condomínio, com dados de serviço, valor, categoria e status.

Além disso, há requisitos funcionais e de experiência:

1. Consulta externa de CNPJ para pré-preencher dados de fornecedor.
2. Aviso explícito nas listagens de pessoas e fornecedores sobre política de edição.
3. Checkbox obrigatório nos modais de cadastro de pessoa e fornecedor com o texto definido no PRD.

Restrições implícitas do contexto atual:

1. Reaproveitar o padrão arquitetural já existente no projeto.
2. Evitar refatorações desnecessárias e introdução de camadas novas sem necessidade.

## 2. O que será construído

## 2.1 Backend (Slim + Eloquent + Phinx)

Novas entidades e persistência:

1. `people`
2. `suppliers`
3. `budgets`
4. tabela pivô para vínculo N:N entre fornecedor e pessoa (`supplier_people`)

Novos componentes por módulo, espelhando o padrão já existente:

1. Models em `server/src/Models`
2. Services em `server/src/Services`
3. Controllers em `server/src/Controllers`
4. Rotas em `server/src/config/routes.php`
5. Migrations em `server/db/migrations`

Rotas REST previstas:

1. `/people` (`GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`)
2. `/suppliers` (`GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`)
3. `/budgets` (`GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`)
4. rota de apoio para CNPJ (exemplo): `/suppliers/cnpj/{cnpj}`

Regras de domínio e integridade no backend:

1. CPF único em `people`.
2. CNPJ único em `suppliers`.
3. `budgets.supplier_id` obrigatório e com FK.
4. `budgets.condominium_id` obrigatório e com FK para `condominiums`.
5. Validações obrigatórias de campos no nível de `Service`, com retorno de erro padronizado já existente.
6. Validação de existência para vínculos (`supplier_id`, `condominium_id`, IDs de pessoas vinculadas ao fornecedor).

## 2.2 Frontend (React + Ant Design + TypeScript)

Novos módulos de interface seguindo o padrão atual de condomínio:

1. Página de listagem por módulo (`People.page.tsx`, `Suppliers.page.tsx`, `Budgets.page.tsx`).
2. Contexto por módulo para estado e carregamento (`contexts`).
3. Componentes de ação por linha (editar/excluir quando aplicável ao fluxo).
4. Modais de cadastro e edição com `Form` do Ant Design.
5. Componente de campos reutilizável por módulo (padrão `*Fields.tsx`).
6. Serviços de API por módulo em `client/src/services` e contratos em `client/src/services/contracts`.
7. Tipos de domínio em `client/src/types`.
8. Entradas de rota e menu lateral no roteador/layout existentes.

Requisitos de UX do PRD:

1. Aviso fixo nas listagens de pessoas e fornecedores: edição de registros existentes é feita apenas pela equipe interna da Gcondo.
2. Checkbox obrigatório nos modais de cadastro de pessoa e fornecedor com o texto:
   `Declaro que os dados informados são verdadeiros e estou ciente de que este registro poderá ser utilizado por outros condomínios da Gcondo.`

Fluxo de CNPJ no cadastro de fornecedor:

1. Usuário informa CNPJ.
2. Front chama endpoint de consulta.
3. Campos retornados são pré-preenchidos.
4. Usuário pode editar manualmente antes de salvar.
5. Em falha, exibir notificação clara e permitir continuidade manual.

## 3. Decisões técnicas importantes

1. Manter padrão de arquitetura existente no backend:
   `routes -> controller -> service -> model`, com validação concentrada em `Service` e exceções HTTP de domínio.
2. Manter padrão de resposta já adotado (`statusCode`, `data` e `error`) para compatibilidade com helpers atuais do frontend.
3. Persistir regras de unicidade no banco (índices únicos), não apenas em validação de aplicação.
4. Implementar relacionamento N:N fornecedor-pessoa por tabela pivô, com relações Eloquent (`belongsToMany`).
5. Tratar categorias e status de orçamento de forma explícita e validada no backend (lista permitida), evitando valores livres.
6. Reaplicar no frontend o padrão já consolidado de `Condominiums`:
   página de listagem + contexto + modal create/edit + service + contract + tipos.
7. Implementar integração de CNPJ via backend (proxy da API externa), evitando acoplamento direto do front com provider externo.
8. Não introduzir novas bibliotecas de estado ou validação se o padrão atual já atende.

## 4. Riscos

1. Dependência de serviço externo de CNPJ (instabilidade, latência, indisponibilidade).
2. Divergência de regras entre frontend e backend (ex.: formatos de CPF/CNPJ, campos obrigatórios).
3. Falhas de integridade em relacionamentos se FKs e validações não forem combinadas.
4. Escopo crescer com regras de permissão (edição apenas equipe interna) além do que existe hoje no projeto.
5. Cobertura parcial de fluxos no frontend se os três módulos não seguirem o mesmo padrão de UX e tratamento de erro.

## 5. Estratégia de validação

Validação técnica por camadas:

1. Banco de dados:
   validar migrations, índices únicos, FKs e criação correta da tabela pivô.
2. API:
   validar CRUD de `people`, `suppliers`, `budgets` e consulta de CNPJ, incluindo cenários de erro.
3. Regras de domínio:
   validar unicidade de CPF/CNPJ, obrigatoriedade dos vínculos de orçamento e listas permitidas de categoria/status.
4. Frontend:
   validar listagem, criação, edição, exclusão, mensagens de erro, aviso obrigatório e checkbox obrigatório.
5. Fluxo de integração CNPJ:
   validar pré-preenchimento com sucesso e fallback manual com falha externa.

Cenários mínimos de aceite:

1. Criar pessoa com sucesso e bloquear CPF duplicado.
2. Criar fornecedor com vínculo de uma ou mais pessoas.
3. Consultar CNPJ e preencher campos automaticamente.
4. Criar orçamento válido vinculado a fornecedor e condomínio existentes.
5. Exibir aviso em listagens de pessoas/fornecedores.
6. Bloquear envio de cadastro de pessoa/fornecedor sem checkbox marcado.
7. Exibir erro claro para vínculo inválido ou campo obrigatório ausente.

## 6. Atualização do plano (implementação atual)

Para manter o plano alinhado ao que foi implementado:

1. Fornecedores possuem operações de edição e exclusão:
   - `PUT /suppliers/{id}`
   - `DELETE /suppliers/{id}`
2. Orçamentos possuem operações de edição e exclusão:
   - `PUT /budgets/{id}`
   - `DELETE /budgets/{id}`
3. Pessoas permanecem com foco em cadastro e consulta nesta etapa:
   - `GET /people`
   - `GET /people/{id}`
   - `POST /people`
