/**
 * Diretório de funcionários do GGPEN — alimentação do autocomplete
 * no formulário "Abrir Chamado". Quando o utilizador escreve as
 * primeiras letras do nome, o componente sugere correspondências e
 * preenche o email automaticamente.
 *
 * Lista importada manualmente a partir do diretório M365 do tenant
 * @ggpen.gov.ao. Pode crescer/desactualizar — quando integrarmos com
 * Azure AD/Graph esta lista é substituída por fetch dinâmico.
 */

export interface Employee {
  nome: string;
  email: string;
}

export const employees: Employee[] = [
  { nome: 'adilson.silva', email: 'adilson.silva@ggpen.gov.ao' },
  { nome: 'admin', email: 'admin@ggpen.gov.ao' },
  { nome: 'Alice Bandeira', email: 'alice.bandeira@ggpen.gov.ao' },
  { nome: 'alicia.narciso', email: 'alicia.narciso@ggpen.gov.ao' },
  { nome: 'AMARO JOÃO', email: 'amaro.joao@ggpen.gov.ao' },
  { nome: 'amilcar.feliciano', email: 'amilcar.feliciano@ggpen.gov.ao' },
  { nome: 'Amilton Evaristo', email: 'amilton.evaristo@ggpen.gov.ao' },
  { nome: 'Américo André', email: 'americo.andre@ggpen.gov.ao' },
  { nome: 'Aniversários Parabéns', email: 'aniversario.parabens@ggpen.gov.ao' },
  { nome: 'António Silva', email: 'antonio.silva@ggpen.gov.ao' },
  { nome: 'aplicacoes.ia', email: 'aplicacoes.ia@ggpen.gov.ao' },
  { nome: 'arminda.jose', email: 'arminda.jose@ggpen.gov.ao' },
  { nome: 'atanilson.cachinjumba', email: 'atanilson.cachinjumba@ggpen.gov.ao' },
  { nome: 'benilde.matano', email: 'benilde.matano@ggpen.gov.ao' },
  { nome: 'branca.bernardo', email: 'branca.bernardo@ggpen.gov.ao' },
  { nome: 'Bruna Yonara João Martin', email: 'bruna.martin@ggpen.gov.ao' },
  { nome: 'carlos.lourenco', email: 'carlos.lourenco@ggpen.gov.ao' },
  { nome: 'chatboat questoes', email: 'chatboat.questoes@ggpen.gov.ao' },
  { nome: 'chefes.departamento', email: 'chefes.departamento@ggpen.gov.ao' },
  { nome: 'cmv', email: 'cmv@ggpen.gov.ao' },
  { nome: 'Coge Paiva', email: 'coge.paiva@ggpen.gov.ao' },
  { nome: 'Comercial GGPEN', email: 'comercial@ggpen.gov.ao' },
  { nome: 'comercial.angosat', email: 'comercial.angosat@ggpen.gov.ao' },
  { nome: 'comercial.ggpen', email: 'comercial.ggpen@ggpen.gov.ao' },
  { nome: 'comercial_angosat', email: 'comercial_angosat@ggpen.gov.ao' },
  { nome: 'comunicacao', email: 'comunicacao@ggpen.gov.ao' },
  { nome: 'conceicao.carvalho', email: 'conceicao.carvalho@ggpen.gov.ao' },
  { nome: 'congolo.sebastiao', email: 'congolo.sebastiao@ggpen.gov.ao' },
  { nome: 'custodio.abilio', email: 'custodio.abilio@ggpen.gov.ao' },
  { nome: 'D G', email: 'dg.oficio@ggpen.gov.ao' },
  { nome: 'Damião Pedro Malebo', email: 'damiao.malebo@ggpen.gov.ao' },
  { nome: 'Daniel Lino Cristiano', email: 'daniel.cristiano@ggpen.gov.ao' },
  { nome: 'daniel.jose', email: 'daniel.jose@ggpen.gov.ao' },
  { nome: 'daniel.kupeia', email: 'daniel.kupeia@ggpen.gov.ao' },
  { nome: 'dario.couceiro', email: 'dario.couceiro@ggpen.gov.ao' },
  { nome: 'dasgmonday', email: 'dasgmonday@ggpen.gov.ao' },
  { nome: 'dcitms', email: 'dcitms@ggpen.gov.ao' },
  { nome: 'diazola.lunda', email: 'diazola.lunda@ggpen.gov.ao' },
  { nome: 'Domingos Manuel', email: 'domingos.manuel@ggpen.gov.ao' },
  { nome: 'Décio Andrade', email: 'decio.andrade@ggpen.gov.ao' },
  { nome: 'Edna Caposso', email: 'edna.caposso@ggpen.gov.ao' },
  { nome: 'elcano.gaspar', email: 'elcano.gaspar@ggpen.gov.ao' },
  { nome: 'Eng. Paulo Danster', email: 'paulo.danster@ggpen.gov.ao' },
  { nome: 'ermeliana.chipita', email: 'ermeliana.chipita@ggpen.gov.ao' },
  { nome: 'etiene.rocha', email: 'etiene.rocha@ggpen.gov.ao' },
  { nome: 'fabiana.andre', email: 'fabiana.andre@ggpen.gov.ao' },
  { nome: 'Fanilson Luimba', email: 'fanilson.luimba@ggpen.gov.ao' },
  { nome: 'fernando.ferreira', email: 'fernando.ferreira@ggpen.gov.ao' },
  { nome: 'financas', email: 'financas@ggpen.gov.ao' },
  { nome: 'first last', email: 'first.last@ggpen.gov.ao' },
  { nome: 'fornecedores', email: 'fornecedores@ggpen.gov.ao' },
  { nome: 'funcionarios.administrativa', email: 'funcionarios.administrativa@ggpen.gov.ao' },
  { nome: 'funcionarios.ggpen', email: 'funcionarios.ggpen@ggpen.gov.ao' },
  { nome: 'gedaemonday', email: 'gedaemonday@ggpen.gov.ao' },
  { nome: 'GGPEN', email: 'geral@ggpen.gov.ao' },
  { nome: 'gilberto.gomes', email: 'gilberto.gomes@ggpen.gov.ao' },
  { nome: 'Gilson Rodrigues', email: 'gilson.rodrigues@ggpen.gov.ao' },
  { nome: 'gilson.santos', email: 'gilson.santos@ggpen.gov.ao' },
  { nome: 'gospel fita', email: 'gospel.fita@ggpen.gov.ao' },
  { nome: 'Helga Rufino', email: 'helga.costa@ggpen.gov.ao' },
  { nome: 'Helkar Bungui', email: 'helkar.bungui@ggpen.gov.ao' },
  { nome: 'Herculano António', email: 'herculano.antonio@ggpen.gov.ao' },
  { nome: 'hermenegildo.damiao', email: 'hermenegildo.damiao@ggpen.gov.ao' },
  { nome: 'hugo.jose', email: 'hugo.jose@ggpen.gov.ao' },
  { nome: 'Info Clientes', email: 'info.clientes@ggpen.gov.ao' },
  { nome: 'inscreveja', email: 'inscreveja@ggpen.gov.ao' },
  { nome: 'isidro.mateus', email: 'isidro.mateus@ggpen.gov.ao' },
  { nome: 'ivandro.rodrigues', email: 'ivandro.rodrigues@ggpen.gov.ao' },
  { nome: 'jean.makunga', email: 'jean.makunga@ggpen.gov.ao' },
  { nome: 'Jesus José', email: 'jesus.jose@ggpen.gov.ao' },
  { nome: 'joao.junior', email: 'joao.junior@ggpen.gov.ao' },
  { nome: 'joaquim.daniel', email: 'joaquim.daniel@ggpen.gov.ao' },
  { nome: 'joaquina.kalandula', email: 'joaquina.kalandula@ggpen.gov.ao' },
  { nome: 'Joel Arsénio Duarte de Jesus', email: 'joel.jesus@ggpen.gov.ao' },
  { nome: 'jorge.pinto', email: 'jorge.pinto@ggpen.gov.ao' },
  { nome: 'josevanio.antonio', email: 'josevanio.antonio@ggpen.gov.ao' },
  { nome: 'juridico', email: 'juridico@ggpen.gov.ao' },
  { nome: 'kassyhandra.conceicao', email: 'kassyhandra.conceicao@ggpen.gov.ao' },
  { nome: 'laurindo.canzau', email: 'laurindo.canzau@ggpen.gov.ao' },
  { nome: 'lea.pazcosta', email: 'lea.pazcosta@ggpen.gov.ao' },
  { nome: 'leonardo.pinheiro', email: 'leonardo.pinheiro@ggpen.gov.ao' },
  { nome: 'leonel.andre', email: 'leonel.andre@ggpen.gov.ao' },
  { nome: 'luciano.lupedia', email: 'luciano.lupedia@ggpen.gov.ao' },
  { nome: 'luis.silva', email: 'luis.silva@ggpen.gov.ao' },
  { nome: 'lumonansoni.andre', email: 'lumonansoni.andre@ggpen.gov.ao' },
  { nome: 'Lídia Nkula', email: 'lidia.nkula@ggpen.gov.ao' },
  { nome: 'madalena.ndolumingo', email: 'madalena.ndolumingo@ggpen.gov.ao' },
  { nome: 'Marcia Montez', email: 'marcia.montez@ggpen.gov.ao' },
  { nome: 'Marisa Bernardo', email: 'marisa.bernardo@ggpen.gov.ao' },
  { nome: 'Masala Samuel Nsungani', email: 'masala.nsungani@ggpen.gov.ao' },
  { nome: 'Mawete Quihila', email: 'mawete.quihila@ggpen.gov.ao' },
  { nome: 'mcc', email: 'mcc@ggpen.gov.ao' },
  { nome: 'mccmonday', email: 'mccmonday@ggpen.gov.ao' },
  { nome: 'Meldimarço Vula', email: 'meldimarco.vula@ggpen.gov.ao' },
  { nome: 'nelson.cunha', email: 'nelson.cunha@ggpen.gov.ao' },
  { nome: 'noc.angosat', email: 'noc.angosat@ggpen.gov.ao' },
  { nome: 'olinda.fischer', email: 'olinda.fischer@ggpen.gov.ao' },
  { nome: 'osvaldo.porto', email: 'osvaldo.porto@ggpen.gov.ao' },
  { nome: 'patricia costa', email: 'patricia.costa@ggpen.gov.ao' },
  { nome: 'paula.jaels', email: 'paula.jaels@ggpen.gov.ao' },
  { nome: 'paulo.gonga', email: 'paulo.gonga@ggpen.gov.ao' },
  { nome: 'pedro.francisco', email: 'pedro.francisco@ggpen.gov.ao' },
  { nome: 'postmaster', email: 'postmaster@ggpen.gov.ao' },
  { nome: 'raadmin', email: 'raadmin@ggpen.gov.ao' },
  { nome: 'RH GGPEN', email: 'rh.informacoes@ggpen.gov.ao' },
  { nome: 'ribeiro.costa', email: 'ribeiro.costa@ggpen.gov.ao' },
  { nome: 'Rodrigo Silva', email: 'rodrigo.silva@ggpen.gov.ao' },
  { nome: 'Sara dos Santos Queirós', email: 'sara.queiros@ggpen.gov.ao' },
  { nome: 'silva.malaca', email: 'silva.malaca@ggpen.gov.ao' },
  { nome: 'solana.ferreira', email: 'solana.ferreira@ggpen.gov.ao' },
  { nome: 'suporte.aplicacoes', email: 'suporte.aplicacoes@ggpen.gov.ao' },
  { nome: 'tarcisio.azevedo', email: 'tarcisio.azevedo@ggpen.gov.ao' },
  { nome: 'telmo.vinhas', email: 'telmo.vinhas@ggpen.gov.ao' },
  { nome: 'teresa.sebastiao', email: 'teresa.sebastiao@ggpen.gov.ao' },
  { nome: 'uriel.pinto', email: 'uriel.pinto@ggpen.gov.ao' },
  { nome: 'vanya.pereira', email: 'vanya.pereira@ggpen.gov.ao' },
  { nome: 'zolana.joao', email: 'zolana.joao@ggpen.gov.ao' },
];

/** Normaliza string para busca case/diacritic insensitive */
export function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[._\-]/g, ' ')
    .trim();
}

/** Devolve até `limit` funcionários cujo nome OU email contém a query. */
export function searchEmployees(query: string, limit = 8): Employee[] {
  const q = normalizeForSearch(query);
  if (q.length < 1) return [];
  return employees
    .filter((e) => {
      const nome = normalizeForSearch(e.nome);
      const email = normalizeForSearch(e.email);
      return nome.includes(q) || email.includes(q);
    })
    .slice(0, limit);
}
