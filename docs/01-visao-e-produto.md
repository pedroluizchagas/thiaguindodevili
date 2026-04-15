# 01 — Visão e Produto

> Contexto de negócio, personas, catálogo, funcionalidades e fases de entrega.

---

## Proposta de Valor

**Quem Fez, Fez!** entrega tudo que você precisa para o churrasco perfeito, sem que você precise sair de casa ou pensar em nada. O cliente escolhe o kit, as bebidas e os opcionais, e nós entregamos o cooler completo no horário combinado.

**Diferenciais:**
- Kits curados em 3 tiers (Raiz, Ouro, Lenda) — sem surpresa no preço
- Carne calculada por pessoa (400g/pessoa) — nada sobra, nada falta
- Cooler com bebidas geladas já incluído
- Opcionais: acendimento profissional + limpeza pós-evento
- Retirada do cooler agendada — sem preocupação no dia seguinte

---

## Personas

### P1 — O Anfitrião Urbano (cliente final)
- Homem ou mulher, 28–45 anos, renda A/B, São Paulo
- Quer fazer um churrasco para 10–30 pessoas sem a logística
- Valoriza conveniência, qualidade e previsibilidade de preço
- Usa smartphone como canal principal
- **Precisa:** pedir pelo celular em minutos, confirmar via WhatsApp, receber no horário

### P2 — O Operador (equipe interna)
- Funcionário da empresa, 20–35 anos
- Gerencia pedidos, monta coolers, faz entregas
- Usa o painel admin no desktop ou celular durante o trabalho
- **Precisa:** ver lista de pedidos do dia, atualizar status, escanear QR do cooler

### P3 — O Administrador
- Sócio ou gerente da empresa
- Monitora KPIs, finanças, estoque de coolers
- Usa o dashboard para tomada de decisão
- **Precisa:** visão geral de pedidos, receita, coolers em campo, relatórios

---

## Catálogo de Produtos (estado atual)

### Kits de Carne

| ID | Nome | Itens | Preço/pessoa |
|---|---|---|---|
| `raiz` | A Resenha Raiz | Contra-filé, Linguiça Toscana, Frango, Coração | R$ 45 |
| `ouro` | O Padrão Ouro | Picanha Importada, Chorizo Argentino, Linguiça Cuiabana, Fraldinha | R$ 75 |
| `lenda` | A Lenda | Tomahawk Angus, Assado de Tira, Picanha Wagyu, Costela Premium | R$ 120 |

### Bebidas

| ID | Nome | Categoria | Preço/unidade |
|---|---|---|---|
| `heineken` | Heineken | cerveja | R$ 7,50 |
| `spaten` | Spaten | cerveja | R$ 6,50 |
| `stella` | Stella Artois | cerveja | R$ 7,00 |
| `corona` | Corona | cerveja | R$ 8,00 |
| `refrigerante` | Refrigerantes Mix | refrigerante | R$ 4,00 |
| `agua` | Água Mineral Crystal | agua | R$ 2,50 |
| `energetico` | Energético Red Bull | energetico | R$ 12,00 |
| `gin-kit` | Kit Gin Premium Tanqueray | gin | R$ 89,00 |

### Serviços Adicionais

| ID | Nome | Preço |
|---|---|---|
| `acendimento` | Acendimento Profissional | R$ 89 |
| `limpeza` | Limpeza Pós-Resenha | R$ 59 |

### Acompanhamentos

| ID | Nome | Preço |
|---|---|---|
| `pao-alho` | Pão de Alho Artesanal (10 un) | R$ 29 |
| `farofa` | Farofa da Casa | R$ 19 |
| `vinagrete` | Vinagrete Fresco | R$ 15 |
| `queijo-coalho` | Queijo Coalho (500g) | R$ 35 |
| `abacaxi` | Abacaxi Caramelizado | R$ 25 |

### Regras de Cálculo

```
meatWeight  = guests * 400g
meatTotal   = guests * meat.pricePerPerson
beverageTotal = sum(beverage.pricePerUnit * beverage.quantity)
servicesTotal = sum(service.price)
sidesTotal  = sum(side.price)
subtotal    = meatTotal + beverageTotal + servicesTotal + sidesTotal
total       = subtotal - discount
```

- Mínimo de convidados: **4**
- Máximo de convidados: **50**
- Desconto: campo manual no admin (operador pode aplicar)

---

## Fluxo do Pedido (jornada completa)

```
Cliente                     Sistema                      Admin/Operador
──────                      ────────                     ──────────────
Acessa o site
  → Builder step 1 (qtd. pessoas)
  → Builder step 2 (kit de carne)
  → Builder step 3 (bebidas)
  → Builder step 4 (serviços/extras)
  → Builder step 5 (checkout: nome, WhatsApp, endereço, data/hora)
  → POST /api/orders
                            Cria customer (ou atualiza)
                            Cria order (status: "new")
                            Retorna { id, orderNumber }
  ← Tela de confirmação
                                                         Vê pedido no Kanban (coluna "Novo")
                                                         Move para "Montagem" → monta cooler
                                                         Move para "Em Rota" → saiu para entrega
                                                         Move para "Entregue" → cliente recebeu
                                                         Move para "Consumindo"
                                                         Agenda recolhimento → "Ag. Recolhimento"
                                                         Coleta cooler → "Recolhido"
                                                         Higieniza → "Finalizado"
```

---

## Status do Pedido (Kanban)

| Status | Label | Descrição |
|---|---|---|
| `new` | Novo Pedido | Pedido recém-criado pelo cliente |
| `picking` | Montagem | Operador montando o cooler |
| `in_route` | Em Rota | Saiu para entrega |
| `delivered` | Entregue | Cooler entregue ao cliente |
| `consuming` | Consumindo | Cliente está usando |
| `scheduled_pickup` | Ag. Recolhimento | Recolhimento agendado |
| `collected` | Recolhido | Cooler recolhido |
| `completed` | Finalizado | Higienizado e encerrado |

---

## Funcionalidades por Plataforma

### Web — Público (não autenticado)
- [x] Homepage institucional (hero, como funciona, diferenciais, combos, depoimentos, franquia, CTA, contato)
- [x] Builder de pedido em 5 etapas
- [x] API de criação de pedido (`POST /api/orders`)
- [ ] Página de confirmação de pedido com número do pedido
- [ ] Página de rastreamento de pedido (consulta pública via `orderNumber`)
- [ ] SEO: meta tags, Open Graph, sitemap.xml, robots.txt

### Web — Admin (autenticado)
- [x] Login/logout
- [x] Dashboard com KPIs
- [x] Kanban de pedidos (8 colunas)
- [x] Tabela de clientes
- [x] Gestão de coolers com QR code
- [ ] Página de detalhe do pedido
- [ ] Edição de pedido (desconto, notas, status manual)
- [ ] Atribuição de motorista a pedido
- [ ] Relatórios de receita (filtro por período)
- [ ] Gestão de usuários/operadores (apenas admin)
- [ ] Configuração de catálogo (preços, itens — apenas admin)

### Mobile — Cliente (Expo)
- [ ] Tela de início / explorar kits
- [ ] Builder de pedido (replicar fluxo web)
- [ ] Rastreamento em tempo real do pedido
- [ ] Histórico de pedidos
- [ ] Perfil do cliente
- [ ] Notificações push (status do pedido)

### Mobile — Operador (Expo)
- [ ] Lista de pedidos do dia
- [ ] Detalhe do pedido
- [ ] Atualização de status (com 1 toque)
- [ ] Scanner de QR code do cooler
- [ ] Confirmação de entrega (foto/assinatura)
- [ ] Rota de entrega (integração Maps)

---

## Fases de Entrega

Ver detalhamento completo em [11-roadmap-execucao.md](./11-roadmap-execucao.md).

| Fase | Foco | Resultado esperado |
|---|---|---|
| 1 — Fundação | Profissionalizar base existente | Monorepo, TypeScript limpo, CI/CD, segurança |
| 2 — Web completo | Completar funcionalidades web | Admin 100%, SEO, testes, performance |
| 3 — Mobile | App cliente + operador | MVP dos dois apps publicados |
| 4 — Produção | Hardening final | Monitoramento, auditoria, carga |
