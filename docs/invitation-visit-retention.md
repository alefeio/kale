# Retenção de visitas aos convites

## Finalidade

Registrar aberturas bem-sucedidas do convite privado no navegador, para organização do casamento (acompanhar visualização, independentemente do RSVP).

## O que é armazenado

- `invitationId` interno
- `visitedAt`
- `eventKey` (idempotência)

Não são armazenados IP, geolocalização, fingerprint, identidade de dispositivo ou user-agent.

## Política

- Os eventos permanecem disponíveis até depois da cerimônia para consulta administrativa.
- Não há exclusão automática durante a janela do evento.
- Após o encerramento organizacional do casamento, os registros podem ser removidos em processo administrativo dedicado.
- Visitas de convites familiares não identificam qual membro abriu o link.

## Deduplicação

- Uma visita registrada por aba/sessão de navegador em janela de 15 minutos.
- Recarregamentos imediatos reutilizam a mesma `eventKey`.
- A unicidade de `eventKey` no banco garante idempotência mesmo com requisições duplicadas.
