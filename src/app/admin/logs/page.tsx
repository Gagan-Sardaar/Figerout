"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileClock, Loader2, ServerCrash } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { getLogEntries, LogEntry } from '@/services/logging-service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const fetchedLogs = await getLogEntries(100); // Fetch last 100 logs
        setLogs(fetchedLogs);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        setError("Could not load activity logs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getBadgeVariant = (logType: string): "default" | "secondary" | "destructive" | "outline" => {
    if (logType.includes('login') || logType.includes('created')) return 'default';
    if (logType.includes('update')) return 'secondary';
    if (logType.includes('delete') || logType.includes('reject')) return 'destructive';
    return 'outline';
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 h-64">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      );
    }
    
    if (error) {
       return (
            <div className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-destructive/20 p-12 text-center text-destructive">
                <ServerCrash className="w-16 h-16 mb-4" />
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    if (logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center text-muted-foreground">
          <FileClock className="w-16 h-16 mb-4" />
          <p>No recent activity has been logged.</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Timestamp</TableHead>
            <TableHead className="w-[150px]">Type</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map(log => (
            <TableRow key={log.id}>
              <TableCell>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="text-muted-foreground text-xs cursor-default">
                           {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>{log.timestamp.toLocaleString()}</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(log.type)}>{log.type.replace(/_/g, ' ')}</Badge>
              </TableCell>
              <TableCell className="text-sm">{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <h1 className="text-lg font-semibold md:text-2xl">Activity Logs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            A stream of the latest events happening across the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
