import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableData {
  partido: string;
  candidato?: string;
  votos: number;
  porcentaje: string;
  color: string;
}

interface ResultsTableProps {
  data: TableData[];
  totalVotos: number;
  showCandidate?: boolean;
}

export const ResultsTable = ({ data, totalVotos, showCandidate = true }: ResultsTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Partido</TableHead>
            {showCandidate && <TableHead>Candidato</TableHead>}
            <TableHead className="text-right">Votos</TableHead>
            <TableHead className="text-right">Porcentaje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color }}
                ></div>
              </TableCell>
              <TableCell className="font-medium">{item.partido}</TableCell>
              {showCandidate && <TableCell>{item.candidato || '-'}</TableCell>}
              <TableCell className="text-right font-mono">
                {item.votos.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono">
                {item.porcentaje}%
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-gray-50">
            <TableCell></TableCell>
            <TableCell colSpan={showCandidate ? 2 : 1}>Total</TableCell>
            <TableCell className="text-right font-mono">
              {totalVotos.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">100.0%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};